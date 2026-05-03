import { Request, Response } from 'express';
import { prisma } from '../config/db';
import BaseController from './baseController';

class AdminController extends BaseController {
  /**
   * @desc    Get Platform Stats
   * @route   GET /api/admin/stats
   */
  public getPlatformStats = async (req: Request, res: Response) => {
    try {
      const [totalUsers, totalAuctions, activeAuctions, transactions] = await Promise.all([
        prisma.user.count(),
        prisma.auction.count(),
        prisma.auction.count({ where: { status: 'active' } }),
        prisma.transaction.findMany({ where: { status: 'completed' } })
      ]);

      const totalRevenue = transactions.reduce((acc, curr) => acc + (curr.amount as any), 0);
      const completedTransactions = transactions.length;

      return this.sendSuccess(res, {
        totalUsers,
        totalAuctions,
        activeAuctions,
        totalRevenue,
        completedTransactions
      });
    } catch (error) {
      return this.sendError(res, 'Failed to fetch platform stats', 500, error);
    }
  };

  /**
   * @desc    Manage Users
   * @route   GET /api/admin/users
   */
  public getAllUsers = async (req: Request, res: Response) => {
    try {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          status: true,
          createdAt: true
        }
      });
      return this.sendSuccess(res, users);
    } catch (error) {
      return this.sendError(res, 'Failed to fetch users', 500, error);
    }
  };

  /**
   * @desc    Update User Status
   * @route   PATCH /api/admin/users/:id/status
   */
  public updateUserStatus = async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      const { id } = req.params;

      if (!['active', 'suspended', 'unverified'].includes(status)) {
        return this.sendError(res, 'Invalid status', 400);
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: { status: status as any }
      });

      return this.sendSuccess(res, updatedUser, 200, `User status updated to ${status}`);
    } catch (error) {
      return this.sendError(res, 'Failed to update user status', 500, error);
    }
  };

  /**
   * @desc    Manage Auctions
   * @route   DELETE /api/admin/auctions/:id
   */
  public deleteFraudulentAuction = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      await prisma.auction.delete({
        where: { id }
      });

      return this.sendSuccess(res, null, 200, 'Auction deleted successfully');
    } catch (error) {
      return this.sendError(res, 'Failed to delete auction', 500, error);
    }
  };

  /**
   * @desc    Close auction manually
   * @route   POST /api/admin/auctions/:id/close
   */
  public closeAuctionManually = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const updatedAuction = await prisma.auction.update({
        where: { id },
        data: { 
          status: 'ended',
          endTime: new Date()
        }
      });

      return this.sendSuccess(res, updatedAuction, 200, 'Auction closed manually');
    } catch (error) {
      return this.sendError(res, 'Failed to close auction', 500, error);
    }
  };
}

export default new AdminController();

