import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodObject } from 'zod';

export const validate = (schema: ZodObject<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error during validation'
      });
    }
  };
};
