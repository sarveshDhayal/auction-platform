import express from 'express';
import authController from '../controllers/authController';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { loginSchema, registerSchema } from '../schemas';

const router = express.Router();

// Public routes
router.post('/register', validate(registerSchema), authController.registerUser);
router.post('/login', validate(loginSchema), authController.loginUser);
router.post('/google', authController.googleAuth);

// Protected routes
router.get('/me', protect, authController.getMe);

export default router;
