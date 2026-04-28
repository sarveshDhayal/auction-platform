/**
 * BaseController - A parent class for all our controllers.
 * This class follows the principle of "Inheritance" in OOP.
 * We put common logic here so we don't have to repeat it in every controller.
 * Written by: Student (BidMaster Team)
 */
class BaseController {
  /**
   * Helper method to send a successful JSON response.
   * Encapsulation: We hide the response structure inside this method.
   */
  sendSuccess(res, data, statusCode = 200, message = 'Success') {
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
  sendError(res, message = 'Something went wrong', statusCode = 500, error = null) {
    console.error(`[Controller Error]: ${message}`, error);
    return res.status(statusCode).json({
      status: 'error',
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: error?.stack })
    });
  }
}

export default BaseController;
