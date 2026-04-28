import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true
    }
  });

  // Authentication Middleware for Socket
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication error: No token provided"));
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on('connection', (socket) => {
    // console.log(`🔌 User connected via socket: ${socket.userId}`);

    // Join a specific auction room
    socket.on('join_auction', async ({ auctionId }) => {
      socket.join(auctionId);
      // console.log(`User ${socket.userId} joined room ${auctionId}`);
      
      // Update Watchers count
      const roomSize = io.sockets.adapter.rooms.get(auctionId)?.size || 0;
      io.to(auctionId).emit('watchers_update', roomSize);
    });

    // Leave a specific auction room
    socket.on('leave_auction', ({ auctionId }) => {
      socket.leave(auctionId);
      const roomSize = io.sockets.adapter.rooms.get(auctionId)?.size || 0;
      io.to(auctionId).emit('watchers_update', roomSize);
    });

    // Handle new bid
    socket.on('place_bid', async (data, callback) => {
      const { auctionId, amount } = data;
      
      try {
        // 1. Fetch Auction Data
        const auction = await prisma.auction.findUnique({ where: { id: auctionId } });
        if (!auction) return callback({ status: 'error', message: 'Auction not found' });
        
        if (auction.status !== 'active') {
          return callback({ status: 'error', message: 'Auction is not active' });
        }

        const currentMax = parseFloat(auction.currentHighestBid) || parseFloat(auction.startingPrice);
        const minValid = currentMax + parseFloat(auction.minIncrement);
        const bidAmount = parseFloat(amount);

        if (bidAmount < minValid) {
          return callback({ status: 'error', message: `Minimum bid is $${minValid}` });
        }

        // 2. Perform DB Updates in a Transaction
        const [newBid, updatedAuction] = await prisma.$transaction([
          prisma.bid.create({
            data: {
              auctionId,
              bidderId: socket.userId,
              amount: bidAmount
            },
            include: { bidder: true } // Need bidder info to broadcast to frontend
          }),
          prisma.auction.update({
            where: { id: auctionId },
            data: { currentHighestBid: bidAmount }
          })
        ]);

        // 3. Broadcast to everyone in the room
        const broadcastData = {
          id: newBid.id,
          amount: newBid.amount,
          time: newBid.createdAt,
          user: {
            id: newBid.bidder.id,
            name: newBid.bidder.fullName,
            avatar: newBid.bidder.avatarUrl
          }
        };

        io.to(auctionId).emit('new_bid', broadcastData);
        
        // 4. Send success callback back to the sender
        callback({ status: 'success', data: broadcastData });

      } catch (error) {
        console.error('Bid Error:', error);
        callback({ status: 'error', message: 'Internal server error while placing bid' });
      }
    });

    socket.on('disconnect', () => {
      // Automatic leave cleanup is handled by socket.io internally
      // console.log(`🔌 User disconnected: ${socket.userId}`);
    });
  });

  return io;
};

// Expose io instance for use in other files (like timerService)
export const getIo = () => {
  if (!io) console.warn('getIo() called before initSocket');
  return io;
};
