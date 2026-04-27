// server/socket/bidHandler.js
const db            = require('../config/db');
const redis         = require('../config/redis');
const stripeService = require('../services/stripeService');
const emailService  = require('../services/emailService');

module.exports = (io) => {
  io.on('connection', (socket) => {

    // Join a specific auction room
    socket.on('join_auction', async (auctionId) => {
      socket.join(`auction_${auctionId}`);

      // Send current state to the new joiner
      const [rows] = await db.query(
        'SELECT current_price, end_time, status FROM auctions WHERE id = ?',
        [auctionId]
      );
      socket.emit('auction_state', rows[0]);

      // Send bid history
      const [bids] = await db.query(
        `SELECT b.amount, u.name, b.created_at
         FROM bids b JOIN users u ON b.bidder_id = u.id
         WHERE b.auction_id = ?
         ORDER BY b.amount DESC LIMIT 10`,
        [auctionId]
      );
      socket.emit('bid_history', bids);
    });

    // Handle a new bid
    socket.on('place_bid', async ({ auctionId, userId, amount, paymentMethodId }) => {
      try {
        // 1. Validate auction is still active
        const [auction] = await db.query(
          'SELECT * FROM auctions WHERE id = ? AND status = "active" AND end_time > NOW()',
          [auctionId]
        );
        if (!auction.length) return socket.emit('bid_error', 'Auction has ended');

        // 2. Validate bid amount
        if (amount <= auction[0].current_price) {
          return socket.emit('bid_error', `Bid must exceed $${auction[0].current_price}`);
        }

        // 3. Create Stripe payment hold (authorize only, don't capture)
        const paymentIntent = await stripeService.createHold(
          userId, amount, paymentMethodId
        );

        // 4. Release the previous highest bidder's hold
        const [prevBid] = await db.query(
          `SELECT b.stripe_pi_id, b.bidder_id, u.email, u.name
           FROM bids b JOIN users u ON b.bidder_id = u.id
           WHERE b.auction_id = ? AND b.hold_status = 'held'
           ORDER BY b.amount DESC LIMIT 1`,
          [auctionId]
        );
        if (prevBid.length) {
          await stripeService.releaseHold(prevBid[0].stripe_pi_id);
          await db.query(
            "UPDATE bids SET hold_status = 'released' WHERE stripe_pi_id = ?",
            [prevBid[0].stripe_pi_id]
          );
          // Notify outbid user via email
          await emailService.sendOutbidEmail(prevBid[0].email, prevBid[0].name, auction[0].title);
        }

        // 5. Save new bid to DB
        await db.query(
          'INSERT INTO bids (auction_id, bidder_id, amount, stripe_pi_id, hold_status) VALUES (?,?,?,?,?)',
          [auctionId, userId, amount, paymentIntent.id, 'held']
        );

        // 6. Update auction current price
        await db.query(
          'UPDATE auctions SET current_price = ? WHERE id = ?',
          [amount, auctionId]
        );

        // 7. Broadcast new bid to everyone in the room
        io.to(`auction_${auctionId}`).emit('new_bid', {
          amount,
          bidderName: socket.user.name,
          timestamp: new Date()
        });

      } catch (err) {
        socket.emit('bid_error', 'Payment authorization failed');
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};
