import { Response, NextFunction } from 'express';
import { OrderService } from '../services/orderService';
import { CreateOrderData, AssignPartnerData, StatusUpdateData } from '../types/order.types';
import { AuthRequest } from '../middleware/auth';

export class OrderController {
  static async createOrder(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const orderData: CreateOrderData = req.body;
      const order = await OrderService.createOrder(orderData, req.user._id);

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  static async getOrders(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const options = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sort: req.query.sort as string || '-createdAt',
        filter: {}
      };

      // Add filters based on query params
      if (req.query.status) {
        options.filter = { ...options.filter, status: req.query.status };
      }

      const result = await OrderService.getOrders(options);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getOrderById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const order = await OrderService.getOrderById(id);

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  static async assignPartner(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { partnerId } = req.body;

      if (!partnerId) {
        res.status(400).json({
          success: false,
          message: 'Partner ID is required'
        });
        return;
      }

      const assignmentData: AssignPartnerData = {
        orderId: id,
        partnerId
      };

      const order = await OrderService.assignPartner(assignmentData);

      res.json({
        success: true,
        message: 'Partner assigned successfully',
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        res.status(400).json({
          success: false,
          message: 'Status is required'
        });
        return;
      }

      const statusData: StatusUpdateData = {
        orderId: id,
        status
      };

      const order = await OrderService.updateOrderStatus(statusData, req.user._id);

      res.json({
        success: true,
        message: 'Order status updated successfully',
        data: order
      });
    } catch (error) {
      next(error);
    }
  }
}