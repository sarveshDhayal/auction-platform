import redis from '../config/redis.js';
import { prisma } from '../config/db.js';
// We'll import the io instance dynamically to avoid circular dependencies if needed,
// but for simplicity, we can pass it or require it where needed.
import { getIo } from '../socket/bidHandler.js';

const AUCTION_ZSET_KEY = 'active_auctions';

/**
 * Registers an auction to end at a specific time in Redis.
 * Uses a Sorted Set where the score is the Unix timestamp (milliseconds).
 */
export const registerAuctionTimer = async (auctionId, endTimestampMs) => {
  try {
    await redis.zadd(AUCTION_ZSET_KEY, endTimestampMs, auctionId);
    console.log(`⏱️ Auction ${auctionId} scheduled to end at ${new Date(endTimestampMs).toISOString()}`);
  } catch (error) {
    console.error(`Failed to register timer for auction ${auctionId}:`, error);
  }
};

/**
 * Processes a single expired auction.
 * Determines the winner, updates DB, and broadcasts via Socket.io.
 */
const processExpiredAuction = async (auctionId) => {
  try {
    console.log(`🏁 Processing expired auction: ${auctionId}`);
    
    // 1. Fetch highest bid
    const highestBid = await prisma.bid.findFirst({
      where: { auctionId },
      orderBy: { amount: 'desc' },
      include: { bidder: true, auction: true }
    });

    const updateData = {
      status: 'ended',
      currentHighestBid: highestBid ? highestBid.amount : undefined,
      winnerId: highestBid ? highestBid.bidderId : null,
    };

    // 2. Update auction in database
    const updatedAuction = await prisma.auction.update({
      where: { id: auctionId },
      data: updateData
    });

    // 3. Broadcast to all users in the auction room
    const io = getIo();
    if (io) {
      io.to(auctionId).emit('auction_ended', {
        auctionId,
        winner: highestBid ? {
          id: highestBid.bidder.id,
          name: highestBid.bidder.fullName,
          avatar: highestBid.bidder.avatarUrl,
          amount: highestBid.amount
        } : null
      });
    }

    // 4. Create Transaction if there is a winner (Step 5 will handle Stripe logic)
    if (highestBid) {
      await prisma.transaction.create({
        data: {
          auctionId: auctionId,
          buyerId: highestBid.bidderId,
          sellerId: highestBid.auction.sellerId,
          amount: highestBid.amount,
          status: 'pending' // Awaiting Stripe payment
        }
      });
      
      // TODO: Trigger Email Notification Service here
    }

  } catch (error) {
    console.error(`Error processing expired auction ${auctionId}:`, error);
  }
};

/**
 * Starts the robust polling loop.
 * Checks the Sorted Set every second for expired timestamps.
 * Production safe: It survives server restarts because the state is in Redis.
 */
export const startTimerWorker = () => {
  console.log('👷 Started Redis Timer Worker for Auction Expirations');
  
  setInterval(async () => {
    try {
      const now = Date.now();
      
      // Get all auction IDs whose score (end time) is less than or equal to `now`
      // Limit to 50 at a time to prevent blocking
      const expiredAuctions = await redis.zrangebyscore(AUCTION_ZSET_KEY, '-inf', now, 'LIMIT', 0, 50);

      if (expiredAuctions.length > 0) {
        // Remove them from the set so they aren't processed twice
        await redis.zrem(AUCTION_ZSET_KEY, ...expiredAuctions);
        
        // Process them asynchronously
        for (const auctionId of expiredAuctions) {
          await processExpiredAuction(auctionId);
        }
      }
    } catch (error) {
      console.error('Timer worker error:', error);
    }
  }, 1000); // Check every 1 second
};
