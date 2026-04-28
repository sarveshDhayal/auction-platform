import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../config/db.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'placeholder');

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ status: 'error', message: 'Please provide all required fields' });
    }

    // Check if user already exists
    const userExists = await prisma.user.findUnique({
      where: { email }
    });

    if (userExists) {
      return res.status(400).json({ status: 'error', message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Auto-generate avatar based on name
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`;

    // Create User
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash: hashedPassword,
        avatarUrl,
        // Optional: auto-activate for MVP, normally 'unverified' requiring email confirmation
        status: 'active' 
      }
    });

    // Return token and user data
    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl
        },
        token: generateToken(user.id)
      }
    });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ status: 'error', message: 'Server error during registration' });
  }
};

/**
 * @desc    Authenticate user & get token (Login)
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Please provide email and password' });
    }

    // Check for user email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ status: 'error', message: 'Account is suspended' });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl
        },
        token: generateToken(user.id)
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ status: 'error', message: 'Server error during login' });
  }
};

/**
 * @desc    Get current logged in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    // req.user is set by the `protect` middleware
    res.status(200).json({
      status: 'success',
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch user profile' });
  }
};

/**
 * @desc    Authenticate with Google
 * @route   POST /api/auth/google
 * @access  Public
 */
export const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    
    // Verify the Google ID Token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    
    if (!payload || !payload.email) {
      return res.status(400).json({ status: 'error', message: 'Invalid Google Token' });
    }

    const { email, name, picture } = payload;

    // Check if user already exists
    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // User exists, but might have signed up normally. Update them to active just in case
      if (user.status === 'unverified' || user.status === 'suspended') {
         // Optionally prevent suspended users, but we'll activate unverified
         if (user.status === 'unverified') {
           user = await prisma.user.update({
             where: { email },
             data: { status: 'active', authProvider: 'google' }
           });
         } else if (user.status === 'suspended') {
           return res.status(403).json({ status: 'error', message: 'Account is suspended' });
         }
      }
    } else {
      // Create new user since they don't exist
      user = await prisma.user.create({
        data: {
          email,
          fullName: name,
          avatarUrl: picture,
          status: 'active', // Automatically active if signed up with Google
          authProvider: 'google'
        }
      });
    }

    // Generate JWT
    const token = generateToken(user.id);

    res.status(200).json({
      status: 'success',
      token,
      data: {
        id: user.id,
        name: user.fullName,
        email: user.email,
        role: user.role,
        avatar: user.avatarUrl
      }
    });

  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ status: 'error', message: 'Google Authentication Failed' });
  }
};
