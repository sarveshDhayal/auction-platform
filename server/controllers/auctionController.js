import { prisma } from '../config/db.js';
import { registerAuctionTimer } from '../services/timerService.js';
import BaseController from './baseController.js';

/**
 * AuctionController Class - Handles the lifecycle of auctions.
 * This class uses "Inheritance" from BaseController to keep our response logic dry.
 */
class AuctionController extends BaseController {
  
  /**
   * @desc    Create new auction
   */
  createAuction = async (req, res) => {
    try {
      const { 
        title, description, category, startingPrice, minIncrement, 
        startTime, endTime, requiresPaymentVerification 
      } = req.body;

      const imageUrl = req.file ? req.file.path : null;

      if (!title || !description || !startingPrice || !endTime) {
        return this.sendError(res, 'Missing required fields', 400);
      }

      const start = new Date(startTime || Date.now());
      const end = new Date(endTime);

      if (end <= start) {
        return this.sendError(res, 'End time must be after start time', 400);
      }

      const newAuction = await prisma.auction.create({
        data: {
          sellerId: req.user.id,
          title,
          description,
          category,
          startingPrice: parseFloat(startingPrice),
          currentHighestBid: parseFloat(startingPrice),
          minIncrement: parseFloat(minIncrement),
          startTime: start,
          endTime: end,
          imageUrl,
          requiresPaymentVerification: requiresPaymentVerification === 'true' || requiresPaymentVerification === true,
          status: start <= new Date() ? 'active' : 'draft',
        }
      });

      if (newAuction.status === 'active') {
        await registerAuctionTimer(newAuction.id, end.getTime());
      }

      return this.sendSuccess(res, newAuction, 201, 'Auction created successfully');

    } catch (error) {
      return this.sendError(res, 'Failed to create auction', 500, error);
    }
  };

  /**
   * @desc    Get all active auctions (with search, filter, pagination)
   */
  getAuctions = async (req, res) => {
    try {
      const { search, category, page = 1, limit = 10, status = 'active' } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const whereClause = { status };
      if (category) whereClause.category = category;
      if (search) {
        whereClause.title = { contains: search, mode: 'insensitive' };
      }

      const [auctions, total] = await Promise.all([
        prisma.auction.findMany({
          where: whereClause,
          include: {
            seller: { select: { fullName: true, avatarUrl: true } }
          },
          orderBy: { endTime: 'asc' },
          skip,
          take: parseInt(limit)
        }),
        prisma.auction.count({ where: whereClause })
      ]);

      return res.status(200).json({
        status: 'success',
        results: auctions.length,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        data: auctions
      });

    } catch (error) {
      return this.sendError(res, 'Failed to fetch auctions', 500, error);
    }
  };

  /**
   * @desc    Get single auction by ID
   */
  getAuctionById = async (req, res) => {
    try {
      const auction = await prisma.auction.findUnique({
        where: { id: req.params.id },
        include: {
          seller: { select: { id: true, fullName: true, avatarUrl: true } },
          winner: { select: { id: true, fullName: true, avatarUrl: true } },
          bids: {
            orderBy: { amount: 'desc' },
            include: {
              bidder: { select: { id: true, fullName: true, avatarUrl: true } }
            }
          }
        }
      });

      if (!auction) {
        return this.sendError(res, 'Auction not found', 404);
      }

      return this.sendSuccess(res, auction);
    } catch (error) {
      return this.sendError(res, 'Failed to fetch auction details', 500, error);
    }
  };

  /**
   * @desc    Get user's own auctions
   */
  getUserAuctions = async (req, res) => {
    try {
      const auctions = await prisma.auction.findMany({
        where: { sellerId: req.user.id },
        orderBy: { createdAt: 'desc' }
      });

      return this.sendSuccess(res, auctions);
    } catch (error) {
      return this.sendError(res, 'Failed to fetch your auctions', 500, error);
    }
  };
}

// Singleton instance for routing
export default new AuctionController();
