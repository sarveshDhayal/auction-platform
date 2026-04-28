import express from 'express';
import { protect } from '../middleware/auth';
import watchlistController from '../controllers/watchlistController';

const router = express.Router();

// All watchlist routes require authentication
router.use(protect);

router.post('/add', watchlistController.addToWatchlist);
router.delete('/remove/:auctionId', watchlistController.removeFromWatchlist);
router.get('/my', watchlistController.getMyWatchlist);

export default router;
