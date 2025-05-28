import { getSocketService } from './socketService';
import Order from '../models/Order';
import { OrderStatus } from '../types/order.types';

export interface OrderTrackingUpdate {
  orderId: string;
  status: OrderStatus;
  timestamp: Date;
  location?: {
    lat: number;
    lng: number;
  };
  estimatedDeliveryTime?: Date;
  message: string;
}

export class TrackingService {
  static async updateOrderTracking(update: OrderTrackingUpdate) {
    try {
      const socketService = getSocketService();
      
      // Emit tracking update to all clients
      socketService.getIO().emit('order_tracking_update', update);
      
      // Store tracking update in order document
      await Order.findByIdAndUpdate(update.orderId, {
        $push: {
          trackingUpdates: {
            status: update.status,
            timestamp: update.timestamp,
            location: update.location,
            message: update.message
          }
        }
      });

      console.log(`Tracking update sent for order ${update.orderId}`);
    } catch (error) {
      console.error('Failed to update order tracking:', error);
    }
  }

  static async getOrderTracking(orderId: string) {
    try {
      const order = await Order.findById(orderId)
        .populate('assignedPartner', 'name email')
        .select('orderId status dispatchTime estimatedDeliveryTime trackingUpdates');

      if (!order) {
        throw new Error('Order not found');
      }

      return {
        orderId: order.orderId,
        currentStatus: order.status,
        dispatchTime: order.dispatchTime,
        estimatedDeliveryTime: order.estimatedDeliveryTime,
        assignedPartner: order.assignedPartner,
        trackingHistory: (order as any).trackingUpdates || []
      };
    } catch (error) {
      console.error('Failed to get order tracking:', error);
      throw error;
    }
  }

  static async subscribeToOrderTracking(socketId: string, orderId: string) {
    try {
      const socketService = getSocketService();
      const socket = socketService.getIO().sockets.sockets.get(socketId);
      
      if (socket) {
        socket.join(`order_${orderId}`);
        console.log(`Socket ${socketId} subscribed to order ${orderId} tracking`);
      }
    } catch (error) {
      console.error('Failed to subscribe to order tracking:', error);
    }
  }

  static async unsubscribeFromOrderTracking(socketId: string, orderId: string) {
    try {
      const socketService = getSocketService();
      const socket = socketService.getIO().sockets.sockets.get(socketId);
      
      if (socket) {
        socket.leave(`order_${orderId}`);
        console.log(`Socket ${socketId} unsubscribed from order ${orderId} tracking`);
      }
    } catch (error) {
      console.error('Failed to unsubscribe from order tracking:', error);
    }
  }
}