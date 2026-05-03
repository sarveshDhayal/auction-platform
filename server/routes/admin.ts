import express from 'express';
import { protect, adminOnly } from '../middleware/auth';
import adminController from '../controllers/adminController';

const router = express.Router();

// All routes require authentication AND admin privileges
router.use(protect, adminOnly);

// Stats
router.get('/stats', adminController.getPlatformStats);

// Users
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/status', adminController.updateUserStatus);

// Auctions
router.delete('/auctions/:id', adminController.deleteFraudulentAuction);
router.post('/auctions/:id/close', adminController.closeAuctionManually);

export default router;
