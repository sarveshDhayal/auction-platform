import { Response } from 'express';
import { createAuctionPaymentIntent } from '../services/stripeService';
import { prisma } from '../config/db';
import BaseController from './baseController';

class PaymentController extends BaseController {
  /**
   * @desc    Create a Stripe PaymentIntent for a won auction
   * @route   POST /api/payments/create-intent
   */
  public createPaymentIntent = async (req: any, res: Response) => {
    try {
      const { auctionId } = req.body;
      const userId = req.user.id;

      if (!auctionId) {
        return this.sendError(res, 'Auction ID is required', 400);
      }

      const paymentIntent = await createAuctionPaymentIntent(auctionId, userId);

      return this.sendSuccess(res, {
        clientSecret: paymentIntent.client_secret
      });

    } catch (error: any) {
      return this.sendError(res, error.message || 'Failed to initialize payment', 500, error);
    }
  };

  /**
   * @desc    Handle successful payment
   * @route   POST /api/payments/confirm
   */
  public confirmPayment = async (req: any, res: Response) => {
    try {
      const { paymentIntentId } = req.body;

      const transaction = await prisma.transaction.findUnique({
        where: { stripePaymentIntentId: paymentIntentId }
      });

      if (!transaction) {
        return this.sendError(res, 'Transaction not found', 404);
      }

      const updatedTransaction = await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'completed' }
      });

      return this.sendSuccess(res, updatedTransaction, 200, 'Payment confirmed successfully');
    } catch (error) {
      return this.sendError(res, 'Failed to confirm payment', 500, error);
    }
  };

  /**
   * @desc    Get all transactions for the current user
   * @route   GET /api/payments/history
   */
  public getTransactions = async (req: any, res: Response) => {
    try {
      const userId = req.user.id;

      const transactions = await prisma.transaction.findMany({
        where: { buyerId: userId },
        include: {
          auction: {
            select: {
              title: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return this.sendSuccess(res, transactions);
    } catch (error) {
      return this.sendError(res, 'Failed to fetch transactions', 500, error);
    }
  };
}

export default new PaymentController();

