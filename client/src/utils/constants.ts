// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

// User Roles
export const USER_ROLES = {
  MANAGER: 'manager',
  DELIVERY: 'delivery'
} as const;

// Order Status
export const ORDER_STATUS = {
  PREP: 'PREP',
  PICKED: 'PICKED',
  ON_ROUTE: 'ON_ROUTE',
  DELIVERED: 'DELIVERED'
} as const;

// Status Colors for UI
export const STATUS_COLORS = {
  [ORDER_STATUS.PREP]: 'bg-yellow-100 text-yellow-800',
  [ORDER_STATUS.PICKED]: 'bg-blue-100 text-blue-800',
  [ORDER_STATUS.ON_ROUTE]: 'bg-purple-100 text-purple-800',
  [ORDER_STATUS.DELIVERED]: 'bg-green-100 text-green-800'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  REMEMBER_ME: 'rememberMe',
  SAVED_EMAIL: 'savedEmail'
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile'
  },
  ORDERS: {
    BASE: '/orders',
    BY_ID: (id: string) => `/orders/${id}`,
    UPDATE_STATUS: (id: string) => `/orders/${id}/status`,
    ASSIGN: (id: string) => `/orders/${id}/assign`
  },
  DELIVERY: {
    PARTNERS: '/delivery/partners',
    MY_ORDERS: '/delivery/my-orders',
    STATUS: (orderId: string) => `/delivery/status/${orderId}`,
    AVAILABILITY: '/delivery/availability'
  }
};

// Form Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PASSWORD_MIN_LENGTH: 'Password must be at least 6 characters',
  PASSWORD_COMPLEXITY: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  PASSWORDS_DONT_MATCH: 'Passwords must match',
  NAME_MIN_LENGTH: 'Name must be at least 2 characters',
  NAME_MAX_LENGTH: 'Name must be less than 50 characters'
};

// Time Constants
export const TIME_CONSTANTS = {
  DEFAULT_PREP_TIME: 30, // minutes
  DEFAULT_DELIVERY_TIME: 20, // minutes
  REFRESH_INTERVAL: 30000, // 30 seconds
  TOKEN_REFRESH_INTERVAL: 300000 // 5 minutes
}; 