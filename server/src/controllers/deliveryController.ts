import { Response, NextFunction } from 'express';
import { DeliveryService } from '../services/deliveryService';
import { OrderService } from '../services/orderService';
import { AuthRequest } from '../middleware/auth';
import { LocationUpdate } from '../types/delivery.types';

export class DeliveryController {
  static async getAvailablePartners(req: AuthRequest, res: Response, next: NextFunction) {
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

  static async toggleAvailability(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
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

  static async updateLocation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const location: LocationUpdate = req.body;

      if (!location.lat || !location.lng) {
        return res.status(400).json({
          success: false,
          message: 'Latitude and longitude are required'
        });
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

  static async getMyOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
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

  static async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
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