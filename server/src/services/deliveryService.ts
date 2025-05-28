import DeliveryPartner from '../models/DeliveryPartner';
import User from '../models/User';
import { UserRole } from '../types/auth.types';
import { LocationUpdate } from '../types/delivery.types';
import { AppError } from '../middleware/errorHandler';

export class DeliveryService {
  static async getAvailablePartners() {
    const partners = await DeliveryPartner.find({ isAvailable: true })
      .populate('userId', 'name email')
      .populate('currentOrders', 'orderId status');

    return partners;
  }

  static async toggleAvailability(userId: string) {
    const deliveryPartner = await DeliveryPartner.findOne({ userId });
    if (!deliveryPartner) {
      throw new AppError('Delivery partner profile not found', 404);
    }

    deliveryPartner.isAvailable = !deliveryPartner.isAvailable;
    await deliveryPartner.save();

    return await DeliveryPartner.findOne({ userId })
      .populate('userId', 'name email')
      .populate('currentOrders', 'orderId status');
  }

  static async updateLocation(userId: string, location: LocationUpdate) {
    const deliveryPartner = await DeliveryPartner.findOne({ userId });
    if (!deliveryPartner) {
      throw new AppError('Delivery partner profile not found', 404);
    }

    deliveryPartner.location = location;
    await deliveryPartner.save();

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