import express from 'express';
import { protect } from '../middleware/auth';
import { upload } from '../config/cloudinary';
import auctionController from '../controllers/auctionController';

import { validate } from '../middleware/validate';
import { auctionSchema } from '../schemas';

const router = express.Router();

// Public Routes
router.get('/', auctionController.getAuctions);
router.get('/:id', auctionController.getAuctionById);

// Protected User Routes
router.get('/user/my-auctions', protect, auctionController.getUserAuctions);

// Upload endpoint mapping: requires auth, expects single file named 'image'
router.post('/', protect, upload.single('image'), validate(auctionSchema), auctionController.createAuction);

export default router;
