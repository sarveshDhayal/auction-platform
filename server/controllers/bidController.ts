import { Request, Response } from 'express';
import { prisma } from '../config/db';
import BaseController from './baseController';

class BidController extends BaseController {
  /**
   * Get bidding history for the authenticated user
   */
  public getMyBiddingHistory = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;

      const bids = await prisma.bid.findMany({
        where: {
          bidderId: userId
        },
        include: {
          auction: {
            select: {
              id: true,
              title: true,
              status: true,
              currentHighestBid: true,
              seller: {
                select: {
                  fullName: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Group by auction or just return unique items with highest bid
      // For history, usually we want to see the "status" relative to the user
      const history = bids.reduce((acc: any[], current) => {
        const existing = acc.find(item => item.auctionId === current.auctionId);
        
        if (!existing) {
          acc.push({
            id: current.id,
            auctionId: current.auction.id,
            item: current.auction.title,
            date: current.createdAt,
            amount: current.amount,
            status: current.auction.status,
            seller: current.auction.seller.fullName,
            isWinning: Number(current.amount) === Number(current.auction.currentHighestBid)
          });
        }
        return acc;
      }, []);

      this.sendSuccess(res, history, 200, 'Bidding history retrieved successfully');
    } catch (error) {
      this.sendError(res, 'Failed to fetch bidding history');
    }
  };
}

export default new BidController();
