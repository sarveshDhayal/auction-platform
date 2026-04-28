import { createAuctionPaymentIntent } from '../services/stripeService.js';
import { prisma } from '../config/db.js';

/**
 * @desc    Create a Stripe PaymentIntent for a won auction
 * @route   POST /api/payments/create-intent
 * @access  Private (Winner only)
 */
export const createPaymentIntent = async (req, res) => {
  try {
    const { auctionId } = req.body;
    const userId = req.user.id;

    if (!auctionId) {
      return res.status(400).json({ status: 'error', message: 'Auction ID is required' });
    }

    const paymentIntent = await createAuctionPaymentIntent(auctionId, userId);

    res.status(200).json({
      status: 'success',
      data: {
        clientSecret: paymentIntent.client_secret
      }
    });

  } catch (error) {
    console.error('Payment Controller Error:', error);
    res.status(500).json({ status: 'error', message: error.message || 'Failed to initialize payment' });
  }
};

/**
 * @desc    Handle successful payment (Usually done via Webhook, but a simple confirmation endpoint works for MVP)
 * @route   POST /api/payments/confirm
 * @access  Private
 */
export const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    const transaction = await prisma.transaction.findUnique({
      where: { stripePaymentIntentId: paymentIntentId }
    });

    if (!transaction) {
      return res.status(404).json({ status: 'error', message: 'Transaction not found' });
    }

    // Mark as completed
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: 'completed' }
    });

    res.status(200).json({ status: 'success', message: 'Payment confirmed successfully' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to confirm payment' });
  }
};
