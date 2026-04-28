import express from 'express';
import { protect } from '../middleware/auth.js';
import { createPaymentIntent, confirmPayment } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/create-intent', protect, createPaymentIntent);
router.post('/confirm', protect, confirmPayment);

export default router;
