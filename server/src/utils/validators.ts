import { CreateOrderData } from '../types/order.types';
import { RegisterData } from '../types/auth.types';

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long' };
  }
  
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return { 
      isValid: false, 
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' 
    };
  }
  
  return { isValid: true };
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

export const validateRegistrationData = (data: RegisterData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.name || data.name.trim() === '') {
    errors.push('Name is required');
  }

  if (!data.email || !validateEmail(data.email)) {
    errors.push('Valid email is required');
  }

  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.isValid) {
    errors.push(passwordValidation.message!);
  }

  if (!data.role || !['manager', 'delivery'].includes(data.role)) {
    errors.push('Valid role is required (manager or delivery)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};