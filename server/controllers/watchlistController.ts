import { Request, Response } from 'express';
import { prisma } from '../config/db';
import BaseController from './baseController';

/**
 * WatchlistController Class - Manages users' saved auctions.
 * Written using OOP principles for better organization.
 */
class WatchlistController extends BaseController {
  
  /**
   * @desc    Add an auction to user's watchlist
   */
  public addToWatchlist = async (req: any, res: Response) => {
    try {
      const { auctionId } = req.body;
      const userId = req.user.id;

      if (!auctionId) {
        return this.sendError(res, 'Auction ID is required', 400);
      }

      // Check if it already exists
      const existing = await prisma.watchlist.findUnique({
        where: {
          userId_auctionId: { userId, auctionId }
        }
      });

      if (existing) {
        return this.sendError(res, 'Auction is already in your watchlist', 400);
      }

      const newWatchlistItem = await prisma.watchlist.create({
        data: { userId, auctionId }
      });

      return this.sendSuccess(res, newWatchlistItem, 201, 'Added to watchlist');
    } catch (error) {
      return this.sendError(res, 'Failed to add to watchlist', 500, error);
    }
  };

  /**
   * @desc    Remove an auction from user's watchlist
   */
  public removeFromWatchlist = async (req: any, res: Response) => {
    try {
      const { auctionId } = req.params;
      const userId = req.user.id;

      await prisma.watchlist.deleteMany({
        where: {
          userId,
          auctionId
        }
      });

      return this.sendSuccess(res, null, 200, 'Removed from watchlist');
    } catch (error) {
      return this.sendError(res, 'Failed to remove from watchlist', 500, error);
    }
  };

  /**
   * @desc    Get user's complete watchlist
   */
  public getMyWatchlist = async (req: any, res: Response) => {
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

      return this.sendSuccess(res, auctions);
    } catch (error) {
      return this.sendError(res, 'Failed to fetch watchlist', 500, error);
    }
  };
}

// Export singleton instance
export default new WatchlistController();
