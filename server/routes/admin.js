import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import { 
  getPlatformStats, 
  getAllUsers, 
  updateUserStatus, 
  deleteFraudulentAuction, 
  closeAuctionManually 
} from '../controllers/adminController.js';

const router = express.Router();

// All routes require authentication AND admin privileges
router.use(protect, adminOnly);

// Stats
router.get('/stats', getPlatformStats);

// Users
router.get('/users', getAllUsers);
router.patch('/users/:id/status', updateUserStatus);

// Auctions
router.delete('/auctions/:id', deleteFraudulentAuction);
router.post('/auctions/:id/close', closeAuctionManually);

export default router;
