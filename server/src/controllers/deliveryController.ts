import { Response, NextFunction } from 'express';
import { DeliveryService } from '../services/deliveryService';
import { OrderService } from '../services/orderService';
import { AuthRequest } from '../middleware/auth';
import { LocationUpdate } from '../types/delivery.types';

export class DeliveryController {
  static async getAvailablePartners(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const partners = await DeliveryService.getAvailablePartners();

      res.json({
        success: true,
        data: partners
      });
    } catch (error) {
      next(error);
    }
  }

  static async toggleAvailability(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const partner = await DeliveryService.toggleAvailability(req.user._id);

      res.json({
        success: true,
        message: 'Availability updated successfully',
        data: partner
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateLocation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const location: LocationUpdate = req.body;

      if (!location.lat || !location.lng) {
        res.status(400).json({
          success: false,
          message: 'Latitude and longitude are required'
        });
        return;
      }

      const partner = await DeliveryService.updateLocation(req.user._id, location);

      res.json({
        success: true,
        message: 'Location updated successfully',
        data: partner
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyOrders(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const options = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sort: req.query.sort as string || '-createdAt'
      };

      const orders = await OrderService.getOrdersByPartner(req.user._id, options);

      res.json({
        success: true,
        data: orders
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const profile = await DeliveryService.getPartnerProfile(req.user._id);

      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(error);
    }
  }
}