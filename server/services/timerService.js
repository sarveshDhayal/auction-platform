// server/services/timerService.js
const redis  = require('../config/redis');
const db     = require('../config/db');
const stripe = require('./stripeService');
const email  = require('./emailService');

async function startAuctionTimer(io, auctionId, endTime) {
  const key = `auction:${auctionId}:timer`;
  await redis.set(key, endTime);

  const interval = setInterval(async () => {
    const remaining = new Date(endTime) - Date.now();

    // Broadcast remaining time to all clients in the room
    io.to(`auction_${auctionId}`).emit('timer_tick', {
      remaining: Math.max(0, remaining)
    });

    if (remaining <= 0) {
      clearInterval(interval);
      await endAuction(io, auctionId);
    }
  }, 1000);
}

async function endAuction(io, auctionId) {
  // Get the winning bid
  const [winner] = await db.query(
    `SELECT b.*, u.email, u.name FROM bids b
     JOIN users u ON b.bidder_id = u.id
     WHERE b.auction_id = ? AND b.hold_status = 'held'
     ORDER BY b.amount DESC LIMIT 1`,
    [auctionId]
  );

  if (winner.length) {
    // Capture winner's payment
    await stripe.capturePayment(winner[0].stripe_pi_id);
    await db.query("UPDATE bids SET hold_status = 'captured' WHERE id = ?", [winner[0].id]);
    await db.query("UPDATE auctions SET status = 'ended', winner_id = ? WHERE id = ?",
      [winner[0].bidder_id, auctionId]);

    await email.sendWinnerEmail(winner[0].email, winner[0].name);
    io.to(`auction_${auctionId}`).emit('auction_ended', {
      winner: winner[0].name,
      amount: winner[0].amount
    });
  } else {
    // No bids — just close
    await db.query("UPDATE auctions SET status = 'ended' WHERE id = ?", [auctionId]);
    io.to(`auction_${auctionId}`).emit('auction_ended', { winner: null });
  }
}

module.exports = { startAuctionTimer };
