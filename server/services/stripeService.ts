import Stripe from 'stripe';
import dotenv from 'dotenv';
import { prisma } from '../config/db';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any, // Cast to any because the exact string might vary in types
});

/**
 * Creates a PaymentIntent for the winning bid of an auction.
 */
export const createAuctionPaymentIntent = async (auctionId: string, userId: string): Promise<any> => {
  try {
    // 1. Fetch the transaction record
    const transaction = await prisma.transaction.findFirst({
      where: {
        auctionId: auctionId,
        buyerId: userId,
        status: 'pending'
      },
      include: { auction: true }
    });

    if (!transaction) {
      throw new Error('No pending transaction found for this user and auction.');
    }

    // 2. Stripe expects amounts in cents for USD
    const amountInCents = Math.round(Number(transaction.amount) * 100);

    // 3. Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: process.env.STRIPE_CURRENCY || 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        transactionId: transaction.id,
        auctionId: auctionId,
        buyerId: userId
      }
    });

    // 4. Update transaction with the Stripe intent ID
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { stripePaymentIntentId: paymentIntent.id }
    });

    return paymentIntent;

  } catch (error) {
    console.error('Stripe Service Error:', error);
    throw error;
  }
};
