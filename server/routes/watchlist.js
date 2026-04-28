import express from 'express';
import { protect } from '../middleware/auth.js';
import { addToWatchlist, removeFromWatchlist, getMyWatchlist } from '../controllers/watchlistController.js';

const router = express.Router();

router.use(protect); // All watchlist routes require authentication

router.post('/add', addToWatchlist);
router.delete('/remove/:auctionId', removeFromWatchlist);
router.get('/my', getMyWatchlist);

export default router;
