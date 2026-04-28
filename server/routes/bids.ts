import express from 'express';
import { protect } from '../middleware/auth';
import bidController from '../controllers/bidController';

const router = express.Router();

router.get('/my-history', protect, bidController.getMyBiddingHistory);

export default router;
