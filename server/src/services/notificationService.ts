import { getSocketService } from './socketService';
import { NotificationEvent } from '../types/socket.types';
import { UserRole } from '../types/auth.types';

export interface NotificationData {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  recipient?: string;
  data?: any;
  persistent?: boolean;
  autoClose?: number; // milliseconds
}

export class NotificationService {
  static async sendToUser(userId: string, notification: NotificationData) {
    try {
      const socketService = getSocketService();
      const event: NotificationEvent = {
        type: notification.type,
        title: notification.title,
        message: notification.message,
        recipient: userId,
        data: notification.data
      };

      socketService.emitNotification(event);
      console.log(`Notification sent to user ${userId}: ${notification.title}`);
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  static async sendToRole(role: UserRole, notification: NotificationData) {
    try {
      const socketService = getSocketService();
      const usersWithRole = socketService.getConnectedUsersByRole(role);

      for (const user of usersWithRole) {
        await this.sendToUser(user.userId, notification);
      }

      console.log(`Notification sent to ${usersWithRole.length} users with role ${role}`);
    } catch (error) {
      console.error('Failed to send role-based notification:', error);
    }
  }

  static async broadcast(notification: NotificationData) {
    try {
      const socketService = getSocketService();
      const event: NotificationEvent = {
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data
      };

      socketService.emitNotification(event);
      console.log(`Broadcast notification sent: ${notification.title}`);
    } catch (error) {
      console.error('Failed to send broadcast notification:', error);
    }
  }

  // Predefined notification templates
  static async notifyOrderCreated(orderId: string, createdBy: string) {
    await this.sendToRole(UserRole.DELIVERY, {
      type: 'info',
      title: 'New Order Available',
      message: `New order ${orderId} is ready for assignment`,
      data: { orderId, action: 'view_orders' }
    });
  }

  static async notifyOrderAssigned(orderId: string, partnerId: string, partnerName: string) {
    await this.sendToUser(partnerId, {
      type: 'success',
      title: 'New Order Assigned',
      message: `You have been assigned to order ${orderId}`,
      data: { orderId, action: 'view_my_orders' }
    });

    await this.sendToRole(UserRole.MANAGER, {
      type: 'info',
      title: 'Order Assigned',
      message: `Order ${orderId} assigned to ${partnerName}`,
      data: { orderId, partnerId }
    });
  }

  static async notifyStatusChange(orderId: string, newStatus: string, updatedBy: string) {
    const statusMessages = {
      'PICKED': 'Order has been picked up',
      'ON_ROUTE': 'Order is on the way',
      'DELIVERED': 'Order has been delivered'
    };

    await this.sendToRole(UserRole.MANAGER, {
      type: 'info',
      title: 'Order Status Updated',
      message: `Order ${orderId}: ${statusMessages[newStatus as keyof typeof statusMessages] || newStatus}`,
      data: { orderId, status: newStatus, updatedBy }
    });
  }

  static async notifyPartnerAvailabilityChange(partnerId: string, partnerName: string, isAvailable: boolean) {
    await this.sendToRole(UserRole.MANAGER, {
      type: isAvailable ? 'success' : 'warning',
      title: 'Partner Availability Changed',
      message: `${partnerName} is now ${isAvailable ? 'available' : 'unavailable'}`,
      data: { partnerId, isAvailable }
    });
  }

  static async notifySystemAlert(message: string, type: 'warning' | 'error' = 'warning') {
    await this.broadcast({
      type: type,
      title: 'System Alert',
      message: message,
      persistent: true
    });
  }
}