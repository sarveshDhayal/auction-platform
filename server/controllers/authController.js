import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../config/db.js';
import BaseController from './baseController.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'placeholder');

/**
 * AuthController Class - Handles all user identity logic.
 * OOP Concept: Inheritance - Extends BaseController to use sendSuccess/sendError.
 * OOP Concept: Encapsulation - Groups related methods into one unit.
 */
class AuthController extends BaseController {
  
  /**
   * Helper to generate JWT Token
   * This is a private-like helper method within our class.
   */
  generateToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
  }

  /**
   * @desc    Register a new user
   */
  registerUser = async (req, res) => {
    try {
      const { fullName, email, password } = req.body;

      if (!fullName || !email || !password) {
        return this.sendError(res, 'Please provide all required fields', 400);
      }

      const userExists = await prisma.user.findUnique({ where: { email } });
      if (userExists) {
        return this.sendError(res, 'User already exists with this email', 400);
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`;

      const user = await prisma.user.create({
        data: {
          fullName,
          email,
          passwordHash: hashedPassword,
          avatarUrl,
          status: 'active' 
        }
      });

      return this.sendSuccess(res, {
        user: {
          id: user.id,
          name: user.fullName,
          email: user.email,
          role: user.role,
          avatar: user.avatarUrl
        },
        token: this.generateToken(user.id)
      }, 201, 'User registered successfully');

    } catch (error) {
      return this.sendError(res, 'Server error during registration', 500, error);
    }
  };

  /**
   * @desc    Authenticate user & get token (Login)
   */
  loginUser = async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return this.sendError(res, 'Please provide email and password', 400);
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return this.sendError(res, 'Invalid credentials', 401);
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return this.sendError(res, 'Invalid credentials', 401);
      }

      if (user.status === 'suspended') {
        return this.sendError(res, 'Account is suspended', 403);
      }

      return this.sendSuccess(res, {
        user: {
          id: user.id,
          name: user.fullName,
          email: user.email,
          role: user.role,
          avatar: user.avatarUrl
        },
        token: this.generateToken(user.id)
      }, 200, 'Login successful');

    } catch (error) {
      return this.sendError(res, 'Server error during login', 500, error);
    }
  };

  /**
   * @desc    Get current logged in user profile
   */
  getMe = async (req, res) => {
    try {
      return this.sendSuccess(res, {
        user: {
          id: req.user.id,
          name: req.user.fullName,
          email: req.user.email,
          role: req.user.role,
          avatar: req.user.avatarUrl
        }
      });
    } catch (error) {
      return this.sendError(res, 'Failed to fetch user profile', 500, error);
    }
  };

  /**
   * @desc    Authenticate with Google
   */
  googleAuth = async (req, res) => {
    try {
      const { credential } = req.body;
      
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      
      if (!payload || !payload.email) {
        return this.sendError(res, 'Invalid Google Token', 400);
      }

      const { email, name, picture } = payload;
      let user = await prisma.user.findUnique({ where: { email } });

      if (user) {
        if (user.status === 'suspended') {
          return this.sendError(res, 'Account is suspended', 403);
        }
        if (user.status === 'unverified') {
          user = await prisma.user.update({
            where: { email },
            data: { status: 'active', authProvider: 'google' }
          });
        }
      } else {
        user = await prisma.user.create({
          data: {
            email,
            fullName: name,
            avatarUrl: picture,
            status: 'active',
            authProvider: 'google'
          }
        });
      }

      const token = this.generateToken(user.id);
      return this.sendSuccess(res, {
        user: {
          id: user.id,
          name: user.fullName,
          email: user.email,
          role: user.role,
          avatar: user.avatarUrl
        },
        token
      }, 200, 'Google Login successful');

    } catch (error) {
      return this.sendError(res, 'Google Authentication Failed', 500, error);
    }
  };
}

// Export a singleton instance of the controller
export default new AuthController();
