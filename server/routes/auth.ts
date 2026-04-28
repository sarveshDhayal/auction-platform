import express from 'express';
import authController from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/google', authController.googleAuth);

// Protected routes
router.get('/me', protect, authController.getMe);

export default router;
