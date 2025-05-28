import Order from '../models/Order';
import DeliveryPartner from '../models/DeliveryPartner';
import User from '../models/User';
import { OrderStatus } from '../types/order.types';
import { UserRole } from '../types/auth.types';

export interface OrderMetrics {
  totalOrders: number;
  ordersByStatus: Record<OrderStatus, number>;
  averagePrepTime: number;
  averageDeliveryTime: number;
  recentOrders: any[];
}

export interface DeliveryMetrics {
  totalPartners: number;
  availablePartners: number;
  busyPartners: number;
  averageOrdersPerPartner: number;
  partnerWorkload: {
    partnerId: string;
    partnerName: string;
    currentOrders: number;
    isAvailable: boolean;
  }[];
}

export interface SystemMetrics {
  orderMetrics: OrderMetrics;
  deliveryMetrics: DeliveryMetrics;
  realTimeData: {
    connectedUsers: number;
    activeOrders: number;
    pendingAssignments: number;
  };
}

export class AnalyticsService {
  static async getOrderMetrics(timeRange: string = '24h'): Promise<OrderMetrics> {
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case '1h':
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // Get total orders in time range
    const totalOrders = await Order.countDocuments({
      createdAt: { $gte: startDate }
    });

    // Get orders by status
    const statusCounts = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const ordersByStatus: Record<OrderStatus, number> = {
      [OrderStatus.PREP]: 0,
      [OrderStatus.PICKED]: 0,
      [OrderStatus.ON_ROUTE]: 0,
      [OrderStatus.DELIVERED]: 0
    };

    statusCounts.forEach(item => {
      ordersByStatus[item._id as OrderStatus] = item.count;
    });

    // Calculate average prep time
    const avgPrepTimeResult = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: null, avgPrepTime: { $avg: '$prepTime' } } }
    ]);

    const averagePrepTime = avgPrepTimeResult[0]?.avgPrepTime || 0;

    // Calculate average delivery time for completed orders
    const avgDeliveryTimeResult = await Order.aggregate([
      { 
        $match: { 
          status: OrderStatus.DELIVERED,
          createdAt: { $gte: startDate },
          dispatchTime: { $exists: true }
        } 
      },
      {
        $addFields: {
          deliveryTime: {
            $divide: [
              { $subtract: ['$updatedAt', '$dispatchTime'] },
              60000 // Convert to minutes
            ]
          }
        }
      },
      { $group: { _id: null, avgDeliveryTime: { $avg: '$deliveryTime' } } }
    ]);

    const averageDeliveryTime = avgDeliveryTimeResult[0]?.avgDeliveryTime || 0;

    // Get recent orders
    const recentOrders = await Order.find({
      createdAt: { $gte: startDate }
    })
      .populate('createdBy', 'name email')
      .populate('assignedPartner', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    return {
      totalOrders,
      ordersByStatus,
      averagePrepTime: Math.round(averagePrepTime),
      averageDeliveryTime: Math.round(averageDeliveryTime),
      recentOrders
    };
  }

  static async getDeliveryMetrics(): Promise<DeliveryMetrics> {
    // Get total partners
    const totalPartners = await DeliveryPartner.countDocuments();

    // Get available partners
    const availablePartners = await DeliveryPartner.countDocuments({ isAvailable: true });

    // Get busy partners (has current orders)
    const busyPartners = await DeliveryPartner.countDocuments({
      currentOrders: { $exists: true, $not: { $size: 0 } }
    });

    // Calculate average orders per partner
    const orderCountResult = await DeliveryPartner.aggregate([
      {
        $addFields: {
          orderCount: { $size: '$currentOrders' }
        }
      },
      {
        $group: {
          _id: null,
          avgOrders: { $avg: '$orderCount' }
        }
      }
    ]);

    const averageOrdersPerPartner = orderCountResult[0]?.avgOrders || 0;

    // Get partner workload details
    const partnerWorkload = await DeliveryPartner.find()
      .populate('userId', 'name email')
      .select('userId isAvailable currentOrders')
      .then(partners => 
        partners.map(partner => ({
          partnerId: (partner.userId as any)._id.toString(),
          partnerName: (partner.userId as any).name,
          currentOrders: partner.currentOrders.length,
          isAvailable: partner.isAvailable
        }))
      );

    return {
      totalPartners,
      availablePartners,
      busyPartners,
      averageOrdersPerPartner: Math.round(averageOrdersPerPartner * 100) / 100,
      partnerWorkload
    };
  }

  static async getSystemMetrics(connectedUsers: number = 0): Promise<SystemMetrics> {
    const orderMetrics = await this.getOrderMetrics();
    const deliveryMetrics = await this.getDeliveryMetrics();

    // Get active orders (not delivered)
    const activeOrders = await Order.countDocuments({
      status: { $ne: OrderStatus.DELIVERED }
    });

    // Get pending assignments
    const pendingAssignments = await Order.countDocuments({
      status: OrderStatus.PREP,
      assignedPartner: { $exists: false }
    });

    return {
      orderMetrics,
      deliveryMetrics,
      realTimeData: {
        connectedUsers,
        activeOrders,
        pendingAssignments
      }
    };
  }
}