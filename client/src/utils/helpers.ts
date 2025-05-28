import { format, formatDistanceToNow, isValid } from 'date-fns';

/**
 * Format date to readable string
 */
export const formatDate = (date: string | Date, formatString: string = 'PPp'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (!isValid(dateObj)) return 'Invalid date';
  return format(dateObj, formatString);
};

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (!isValid(dateObj)) return 'Invalid date';
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

/**
 * Capitalize first letter of a string
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Format order status for display
 */
export const formatOrderStatus = (status: string): string => {
  switch (status) {
    case 'PREP':
      return 'In Preparation';
    case 'PICKED':
      return 'Picked Up';
    case 'ON_ROUTE':
      return 'On Route';
    case 'DELIVERED':
      return 'Delivered';
    default:
      return capitalize(status);
  }
};

/**
 * Generate a random order ID
 */
export const generateOrderId = (): string => {
  const prefix = 'ORD';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

/**
 * Calculate estimated delivery time
 */
export const calculateEstimatedDeliveryTime = (
  prepTime: number,
  deliveryTime: number = 20
): Date => {
  const now = new Date();
  const totalMinutes = prepTime + deliveryTime;
  return new Date(now.getTime() + totalMinutes * 60000);
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 6) score++;
  else feedback.push('Password must be at least 6 characters');

  if (/[a-z]/.test(password)) score++;
  else feedback.push('Add lowercase letters');

  if (/[A-Z]/.test(password)) score++;
  else feedback.push('Add uppercase letters');

  if (/\d/.test(password)) score++;
  else feedback.push('Add numbers');

  if (/[^a-zA-Z\d]/.test(password)) score++;
  else feedback.push('Add special characters');

  return {
    isValid: score >= 3,
    score,
    feedback
  };
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Format currency
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
};

/**
 * Format duration in minutes to human readable format
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

/**
 * Get initials from name
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackErr) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

/**
 * Check if user is online
 */
export const isOnline = (): boolean => {
  return navigator.onLine;
};

/**
 * Local storage helpers with error handling
 */
export const storage = {
  get: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },
  
  set: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      return false;
    }
  },
  
  remove: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  },
  
  clear: (): boolean => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
}; 