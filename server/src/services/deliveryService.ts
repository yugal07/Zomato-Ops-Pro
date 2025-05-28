import DeliveryPartner from '../models/DeliveryPartner';
import User from '../models/User';
import { UserRole } from '../types/auth.types';
import { LocationUpdate } from '../types/delivery.types';
import { AppError } from '../middleware/errorHandler';
import { getSocketService } from './socketService';
import { PartnerAvailabilityEvent, PartnerLocationEvent } from '../types/socket.types';

export class DeliveryService {
  static async getAvailablePartners() {
    const partners = await DeliveryPartner.find({ isAvailable: true })
      .populate('userId', 'name email')
      .populate('currentOrders', 'orderId status');

    return partners;
  }

  static async toggleAvailability(userId: string) {
    const deliveryPartner = await DeliveryPartner.findOne({ userId })
      .populate('userId', 'name email');
      
    if (!deliveryPartner) {
      throw new AppError('Delivery partner profile not found', 404);
    }

    const wasAvailable = deliveryPartner.isAvailable;
    deliveryPartner.isAvailable = !deliveryPartner.isAvailable;
    await deliveryPartner.save();

    const updatedPartner = await DeliveryPartner.findOne({ userId })
      .populate('userId', 'name email')
      .populate('currentOrders', 'orderId status');

    // Emit real-time event
    try {
      const socketService = getSocketService();
      const partnerUser = deliveryPartner.userId as any;
      
      const event: PartnerAvailabilityEvent = {
        partnerId: userId,
        partnerName: partnerUser.name,
        isAvailable: deliveryPartner.isAvailable,
        currentOrdersCount: deliveryPartner.currentOrders.length,
        message: `${partnerUser.name} is now ${deliveryPartner.isAvailable ? 'available' : 'unavailable'}`
      };
      
      socketService.emitPartnerAvailabilityChanged(event);
      
      // Send notification
      socketService.emitNotification({
        type: deliveryPartner.isAvailable ? 'success' : 'info',
        title: 'Availability Updated',
        message: `You are now ${deliveryPartner.isAvailable ? 'available' : 'unavailable'} for deliveries`,
        recipient: userId
      });
    } catch (error) {
      console.error('Socket emission error:', error);
    }

    return updatedPartner;
  }

  static async updateLocation(userId: string, location: LocationUpdate) {
    const deliveryPartner = await DeliveryPartner.findOne({ userId });
    if (!deliveryPartner) {
      throw new AppError('Delivery partner profile not found', 404);
    }

    deliveryPartner.location = location;
    await deliveryPartner.save();

    // Emit real-time event
    try {
      const socketService = getSocketService();
      
      const event: PartnerLocationEvent = {
        partnerId: userId,
        location: location,
        timestamp: new Date()
      };
      
      socketService.emitPartnerLocationUpdated(event);
    } catch (error) {
      console.error('Socket emission error:', error);
    }

    return deliveryPartner;
  }

  static async getPartnerProfile(userId: string) {
    const deliveryPartner = await DeliveryPartner.findOne({ userId })
      .populate('userId', 'name email')
      .populate('currentOrders', 'orderId status items prepTime');

    if (!deliveryPartner) {
      throw new AppError('Delivery partner profile not found', 404);
    }

    return deliveryPartner;
  }
}