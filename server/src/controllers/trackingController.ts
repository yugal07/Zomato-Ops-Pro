import { Response, NextFunction } from 'express';
import { TrackingService } from '../services/trackingService';
import { AuthRequest } from '../middleware/auth';

export class TrackingController {
  static async getOrderTracking(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId } = req.params;
      const tracking = await TrackingService.getOrderTracking(orderId);

      res.json({
        success: true,
        data: tracking
      });
    } catch (error) {
      next(error);
    }
  }

  static async subscribeToTracking(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId } = req.params;
      const socketId = req.body.socketId;

      if (!socketId) {
        res.status(400).json({
          success: false,
          message: 'Socket ID is required'
        });
        return;
      }

      await TrackingService.subscribeToOrderTracking(socketId, orderId);

      res.json({
        success: true,
        message: 'Subscribed to order tracking'
      });
    } catch (error) {
      next(error);
    }
  }
}