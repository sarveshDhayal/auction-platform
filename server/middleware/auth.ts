import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';

interface DecodedToken {
  id: string;
  iat: number;
  exp: number;
}

/**
 * Middleware to protect routes. 
 * Requires a valid JWT in the Authorization header.
 */
export const protect = async (req: any, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token!, process.env.JWT_SECRET!) as DecodedToken;

      // Get user from the token payload (excluding password)
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          status: true,
          avatarUrl: true
        }
      });

      if (!user) {
        return res.status(401).json({ status: 'error', message: 'Not authorized, user not found' });
      }

      if (user.status === 'suspended') {
        return res.status(403).json({ status: 'error', message: 'Account is suspended' });
      }

      // Attach user object to the request
      req.user = user as any;
      next();
    } catch (error: any) {
      console.error('Token verification failed:', error.message);
      return res.status(401).json({ status: 'error', message: 'Not authorized, invalid token' });
    }
  } else {
    return res.status(401).json({ status: 'error', message: 'Not authorized, no token provided' });
  }
};

/**
 * Middleware to restrict access to admin users only.
 * Must be used AFTER the `protect` middleware.
 */
export const adminOnly = (req: any, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ status: 'error', message: 'Not authorized, requires admin privileges' });
  }
};
