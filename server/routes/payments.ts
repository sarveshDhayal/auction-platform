import express from 'express';
import { protect } from '../middleware/auth';
import { createPaymentIntent, confirmPayment } from '../controllers/paymentController';

const router = express.Router();

router.post('/create-intent', protect, createPaymentIntent);
router.post('/confirm', protect, confirmPayment);

export default router;
