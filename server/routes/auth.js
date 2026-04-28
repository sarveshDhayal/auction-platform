import express from 'express';
import { registerUser, loginUser, getMe, googleAuth } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);

// Protected routes
router.get('/me', protect, getMe);

export default router;
