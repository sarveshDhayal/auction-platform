import express from 'express';
import { protect } from '../middleware/auth';
import paymentController from '../controllers/paymentController';

const router = express.Router();

router.post('/create-intent', protect, paymentController.createPaymentIntent);
router.post('/confirm', protect, paymentController.confirmPayment);
router.get('/history', protect, paymentController.getTransactions);

export default router;
