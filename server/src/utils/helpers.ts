import { OrderStatus } from '../types/order.types';

export const generateOrderId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `ORD${timestamp}${random}`.toUpperCase();
};

export const calculateDispatchTime = (prepTime: number, deliveryETA: number = 30): Date => {
  const now = new Date();
  const totalTime = prepTime + deliveryETA;
  return new Date(now.getTime() + totalTime * 60000); // Convert minutes to milliseconds
};

export const validateStatusTransition = (currentStatus: OrderStatus, newStatus: OrderStatus): boolean => {
  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PREP]: [OrderStatus.PICKED],
    [OrderStatus.PICKED]: [OrderStatus.ON_ROUTE],
    [OrderStatus.ON_ROUTE]: [OrderStatus.DELIVERED],
    [OrderStatus.DELIVERED]: []
  };

  return validTransitions[currentStatus]?.includes(newStatus) || false;
};

export const sanitizeQuery = (query: any): any => {
  const sanitized: any = {};
  
  for (const key in query) {
    if (query[key] !== undefined && query[key] !== null && query[key] !== '') {
      sanitized[key] = query[key];
    }
  }
  
  return sanitized;
};

export const getPaginationOptions = (page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;
  return { skip, limit };
};