import express from 'express';
import { protect } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';
import { 
  createAuction, 
  getAuctions, 
  getAuctionById, 
  getUserAuctions 
} from '../controllers/auctionController.js';

const router = express.Router();

// Public Routes
router.get('/', getAuctions);
router.get('/:id', getAuctionById);

// Protected User Routes
router.get('/user/my-auctions', protect, getUserAuctions);

// Upload endpoint mapping: requires auth, expects single file named 'image'
router.post('/', protect, upload.single('image'), createAuction);

export default router;
