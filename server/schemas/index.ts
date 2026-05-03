import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const auctionSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  startingPrice: z.coerce.number().positive('Starting price must be positive'),
  minIncrement: z.coerce.number().positive('Minimum increment must be positive'),
  endTime: z.string().refine((val) => new Date(val) > new Date(), {
    message: "End time must be in the future"
  }),
  requiresPaymentVerification: z.preprocess((val) => {
    if (typeof val === 'string') return val === 'true';
    return val;
  }, z.boolean()).default(true)
});

export const bidSchema = z.object({
  amount: z.coerce.number().positive('Bid amount must be positive'),
  auctionId: z.string()
});

export const profileUpdateSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  avatarUrl: z.string().url().optional().or(z.literal(''))
});
