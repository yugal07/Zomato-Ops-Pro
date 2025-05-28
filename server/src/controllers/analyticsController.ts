import { Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analyticsService';
import { AuthRequest } from '../middleware/auth';
import { getSocketService } from '../services/socketService';

export class AnalyticsController {
  static async getOrderMetrics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const timeRange = req.query.timeRange as string || '24h';
      const metrics = await AnalyticsService.getOrderMetrics(timeRange);

      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      next(error);
    }
  }

  static async getDeliveryMetrics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const metrics = await AnalyticsService.getDeliveryMetrics();

      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSystemMetrics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const socketService = getSocketService();
      const connectedUsers = socketService.getConnectedUsers().length;
      
      const metrics = await AnalyticsService.getSystemMetrics(connectedUsers);

      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      next(error);
    }
  }

  static async getConnectedUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const socketService = getSocketService();
      const connectedUsers = socketService.getConnectedUsers();

      res.json({
        success: true,
        data: {
          totalConnected: connectedUsers.length,
          users: connectedUsers.map(user => ({
            userId: user.userId,
            role: user.role,
            isOnline: user.isOnline
          }))
        }
      });
    } catch (error) {
      next(error);
    }
  }
}