import { prisma } from '../config/db.js';

/**
 * @desc    Add an auction to user's watchlist
 * @route   POST /api/watchlist/add
 * @access  Private
 */
export const addToWatchlist = async (req, res) => {
  try {
    const { auctionId } = req.body;
    const userId = req.user.id;

    if (!auctionId) {
      return res.status(400).json({ status: 'error', message: 'Auction ID is required' });
    }

    // Check if it already exists
    const existing = await prisma.watchlist.findUnique({
      where: {
        userId_auctionId: { userId, auctionId }
      }
    });

    if (existing) {
      return res.status(400).json({ status: 'error', message: 'Auction is already in your watchlist' });
    }

    const newWatchlistItem = await prisma.watchlist.create({
      data: { userId, auctionId }
    });

    res.status(201).json({ status: 'success', message: 'Added to watchlist', data: newWatchlistItem });
  } catch (error) {
    console.error('Watchlist Add Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to add to watchlist' });
  }
};

/**
 * @desc    Remove an auction from user's watchlist
 * @route   DELETE /api/watchlist/remove/:auctionId
 * @access  Private
 */
export const removeFromWatchlist = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const userId = req.user.id;

    await prisma.watchlist.delete({
      where: {
        userId_auctionId: { userId, auctionId }
      }
    });

    res.status(200).json({ status: 'success', message: 'Removed from watchlist' });
  } catch (error) {
    // If it doesn't exist, prisma throws a P2025 error, we can safely ignore or return 404
    console.error('Watchlist Remove Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to remove from watchlist' });
  }
};

/**
 * @desc    Get user's complete watchlist
 * @route   GET /api/watchlist/my
 * @access  Private
 */
export const getMyWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const watchlist = await prisma.watchlist.findMany({
      where: { userId },
      include: {
        auction: {
          include: {
            seller: { select: { fullName: true, avatarUrl: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Format the response to just send back the array of auctions
    const auctions = watchlist.map(item => item.auction);

    res.status(200).json({ status: 'success', data: auctions });
  } catch (error) {
    console.error('Watchlist Fetch Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch watchlist' });
  }
};
