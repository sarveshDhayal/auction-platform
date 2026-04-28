import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import authRoutes from './routes/auth.js';
import auctionRoutes from './routes/auctions.js';
import paymentRoutes from './routes/payments.js';
import { initSocket } from './socket/bidHandler.js';
import { startTimerWorker } from './services/timerService.js';

dotenv.config();

const app = express();
const server = http.createServer(app); // Needed for Socket.io

// Initialize Socket.io
initSocket(server);

// Start the Redis Polling Timer Service
startTimerWorker();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/payments', paymentRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'BidMaster API is running' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

// IMPORTANT: use server.listen instead of app.listen for WebSockets!
server.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
