import { OrderStatus, CreateOrderData } from '../types/order.types';

export const generateOrderId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `ORD${timestamp}${random}`.toUpperCase();
};

export const validateOrderData = (orderData: CreateOrderData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!orderData.items || orderData.items.length === 0) {
    errors.push('Order must have at least one item');
  }

  if (orderData.items) {
    orderData.items.forEach((item, index) => {
      if (!item.name || item.name.trim() === '') {
        errors.push(`Item ${index + 1}: Name is required`);
      }
      if (!item.quantity || item.quantity < 1) {
        errors.push(`Item ${index + 1}: Quantity must be at least 1`);
      }
      if (item.price < 0) {
        errors.push(`Item ${index + 1}: Price cannot be negative`);
      }
    });
  }

  if (!orderData.prepTime || orderData.prepTime < 1 || orderData.prepTime > 120) {
    errors.push('Preparation time must be between 1 and 120 minutes');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
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