import express from 'express';
import { protect } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';
import auctionController from '../controllers/auctionController.js';

const router = express.Router();

// Public Routes
router.get('/', auctionController.getAuctions);
router.get('/:id', auctionController.getAuctionById);

// Protected User Routes
router.get('/user/my-auctions', protect, auctionController.getUserAuctions);

// Upload endpoint mapping: requires auth, expects single file named 'image'
router.post('/', protect, upload.single('image'), auctionController.createAuction);

export default router;
