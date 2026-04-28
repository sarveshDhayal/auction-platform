/**
 * BaseController - A parent class for all our controllers.
 * This class follows the principle of "Inheritance" in OOP.
 * We put common logic here so we don't have to repeat it in every controller.
 * Written by: Student (BidMaster Team)
 */
import { Response } from 'express';

class BaseController {
  /**
   * Helper method to send a successful JSON response.
   * Encapsulation: We hide the response structure inside this method.
   */
  protected sendSuccess(res: Response, data: any, statusCode: number = 200, message: string = 'Success') {
    return res.status(statusCode).json({
      status: 'success',
      message,
      results: Array.isArray(data) ? data.length : undefined,
      data
    });
  }

  /**
   * Helper method to send an error JSON response.
   */
  protected sendError(res: Response, message: string = 'Something went wrong', statusCode: number = 500, error: any = null) {
    console.error(`[Controller Error]: ${message}`, error);
    return res.status(statusCode).json({
      status: 'error',
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: error?.stack })
    });
  }
}

export default BaseController;
