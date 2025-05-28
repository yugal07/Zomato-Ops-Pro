import Order from '../models/Order';
import DeliveryPartner from '../models/DeliveryPartner';
import User from '../models/User';
import { CreateOrderData, AssignPartnerData, StatusUpdateData, OrderStatus } from '../types/order.types';
import { QueryOptions, PaginatedResponse } from '../types/api.types';
import { AppError } from '../middleware/errorHandler';
import { validateOrderData, validateStatusTransition, calculateDispatchTime } from '../utils/helpers';
import { getSocketService } from './socketService';
import { OrderCreatedEvent, OrderAssignedEvent, StatusUpdatedEvent } from '../types/socket.types';

export class OrderService {
  static async createOrder(orderData: CreateOrderData, createdBy: string) {
    // Validate order data
    const validation = validateOrderData(orderData);
    if (!validation.isValid) {
      throw new AppError(`Validation failed: ${validation.errors.join(', ')}`, 400);
    }

    // Create order
    const order = await Order.create({
      ...orderData,
      createdBy
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('createdBy', 'name email')
      .populate('assignedPartner', 'name email');

    // Emit real-time event
    try {
      const socketService = getSocketService();
      const event: OrderCreatedEvent = {
        order: populatedOrder,
        message: `New order ${order.orderId} has been created`
      };
      socketService.emitOrderCreated(event);
      
      // Send notification
      socketService.emitNotification({
        type: 'success',
        title: 'New Order',
        message: `Order ${order.orderId} created successfully`
      });
    } catch (error) {
      console.error('Socket emission error:', error);
    }

    return populatedOrder;
  }

  static async assignPartner(assignmentData: AssignPartnerData) {
    const { orderId, partnerId } = assignmentData;

    // Find order
    const order = await Order.findById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Check if order is in PREP status
    if (order.status !== OrderStatus.PREP) {
      throw new AppError('Can only assign partners to orders in PREP status', 400);
    }

    // Check if order already has a partner
    if (order.assignedPartner) {
      throw new AppError('Order already has an assigned partner', 400);
    }

    // Find delivery partner
    const deliveryPartner = await DeliveryPartner.findOne({ userId: partnerId })
      .populate('userId', 'name email role');

    if (!deliveryPartner) {
      throw new AppError('Delivery partner not found', 404);
    }

    // Check if partner is available
    if (!deliveryPartner.isAvailable) {
      throw new AppError('Delivery partner is not available', 400);
    }

    // Check if partner has capacity (max 3 orders)
    if (deliveryPartner.currentOrders.length >= 3) {
      throw new AppError('Delivery partner has reached maximum capacity', 400);
    }

    // Check if partner is already assigned to this order
    if (deliveryPartner.currentOrders.includes(order._id)) {
      throw new AppError('Partner is already assigned to this order', 400);
    }

    // Calculate dispatch time
    const dispatchTime = calculateDispatchTime(order.prepTime, deliveryPartner.averageDeliveryTime);

    // Update order
    order.assignedPartner = partnerId as any;
    order.dispatchTime = dispatchTime;
    order.estimatedDeliveryTime = new Date(dispatchTime.getTime() + deliveryPartner.averageDeliveryTime * 60000);
    await order.save();

    // Update delivery partner
    deliveryPartner.currentOrders.push(order._id);
    await deliveryPartner.save();

    const updatedOrder = await Order.findById(orderId)
      .populate('createdBy', 'name email')
      .populate('assignedPartner', 'name email');

    // Emit real-time event
    try {
      const socketService = getSocketService();
      const partnerUser = deliveryPartner.userId as any;
      
      const event: OrderAssignedEvent = {
        orderId: order._id.toString(),
        partnerId: partnerId,
        partnerName: partnerUser.name,
        dispatchTime: dispatchTime,
        message: `Order ${order.orderId} has been assigned to ${partnerUser.name}`
      };
      
      socketService.emitOrderAssigned(event);
      
      // Send notifications
      socketService.emitNotification({
        type: 'info',
        title: 'Order Assigned',
        message: `Order ${order.orderId} assigned to ${partnerUser.name}`,
        recipient: partnerId
      });
      
      socketService.emitNotification({
        type: 'success',
        title: 'Partner Assigned',
        message: `${partnerUser.name} assigned to order ${order.orderId}`
      });
    } catch (error) {
      console.error('Socket emission error:', error);
    }

    return updatedOrder;
  }

  static async updateOrderStatus(statusData: StatusUpdateData, updatedBy: string) {
    const { orderId, status } = statusData;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Validate status transition
    if (!validateStatusTransition(order.status, status)) {
      throw new AppError(`Invalid status transition from ${order.status} to ${status}`, 400);
    }

    const oldStatus = order.status;

    // Update order status
    order.status = status;

    // If delivered, update partner availability
    if (status === OrderStatus.DELIVERED && order.assignedPartner) {
      const deliveryPartner = await DeliveryPartner.findOne({ userId: order.assignedPartner });
      if (deliveryPartner) {
        deliveryPartner.currentOrders = deliveryPartner.currentOrders.filter(
          id => id.toString() !== orderId
        );
        await deliveryPartner.save();
      }
    }

    await order.save();

    const updatedOrder = await Order.findById(orderId)
      .populate('createdBy', 'name email')
      .populate('assignedPartner', 'name email');

    // Get user who updated the status
    const updatedByUser = await User.findById(updatedBy);

    // Emit real-time event
    try {
      const socketService = getSocketService();
      
      const event: StatusUpdatedEvent = {
        orderId: orderId,
        oldStatus: oldStatus,
        newStatus: status,
        updatedBy: updatedBy,
        updatedByName: updatedByUser?.name || 'Unknown',
        timestamp: new Date(),
        message: `Order ${order.orderId} status changed from ${oldStatus} to ${status}`
      };
      
      socketService.emitStatusUpdated(event);
      
      // Send notification
      socketService.emitNotification({
        type: 'info',
        title: 'Status Updated',
        message: `Order ${order.orderId} is now ${status}`,
        data: { orderId, newStatus: status }
      });
    } catch (error) {
      console.error('Socket emission error:', error);
    }

    return updatedOrder;
  }

  // ... (keep other existing methods unchanged)
  static async getOrders(options: QueryOptions = {}) {
    const { page = 1, limit = 10, sort = '-createdAt', filter = {} } = options;
    const skip = (page - 1) * limit;

    const query = Order.find(filter)
      .populate('createdBy', 'name email')
      .populate('assignedPartner', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const orders = await query;
    const total = await Order.countDocuments(filter);

    return {
      data: orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    } as PaginatedResponse<typeof orders[0]>;
  }

  static async getOrderById(orderId: string) {
    const order = await Order.findById(orderId)
      .populate('createdBy', 'name email')
      .populate('assignedPartner', 'name email');

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    return order;
  }

  static async getOrdersByPartner(partnerId: string, options: QueryOptions = {}) {
    const deliveryPartner = await DeliveryPartner.findOne({ userId: partnerId });
    if (!deliveryPartner) {
      throw new AppError('Delivery partner profile not found', 404);
    }

    const { page = 1, limit = 10, sort = '-createdAt' } = options;
    const skip = (page - 1) * limit;

    const filter = { assignedPartner: partnerId };
    
    const orders = await Order.find(filter)
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(filter);

    return {
      data: orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    } as PaginatedResponse<typeof orders[0]>;
  }
}