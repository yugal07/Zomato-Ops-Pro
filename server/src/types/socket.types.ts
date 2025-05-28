import { OrderStatus } from './order.types';
import { UserRole } from './auth.types';

export interface SocketUser {
  userId: string;
  role: UserRole;
  socketId: string;
  isOnline: boolean;
}

export interface OrderCreatedEvent {
  order: any;
  message: string;
}

export interface OrderAssignedEvent {
  orderId: string;
  partnerId: string;
  partnerName: string;
  dispatchTime: Date;
  message: string;
}

export interface StatusUpdatedEvent {
  orderId: string;
  oldStatus: OrderStatus;
  newStatus: OrderStatus;
  updatedBy: string;
  updatedByName: string;
  timestamp: Date;
  message: string;
}

export interface PartnerAvailabilityEvent {
  partnerId: string;
  partnerName: string;
  isAvailable: boolean;
  currentOrdersCount: number;
  message: string;
}

export interface PartnerLocationEvent {
  partnerId: string;
  location: {
    lat: number;
    lng: number;
  };
  timestamp: Date;
}

export interface NotificationEvent {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  recipient?: string; // specific user ID, if empty - broadcast
  data?: any;
}

// Socket event names
export enum SocketEvents {
  // Connection events
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  JOIN_ROOM = 'join_room',
  LEAVE_ROOM = 'leave_room',
  
  // Order events
  ORDER_CREATED = 'order_created',
  ORDER_ASSIGNED = 'order_assigned',
  ORDER_STATUS_UPDATED = 'order_status_updated',
  
  // Partner events
  PARTNER_AVAILABILITY_CHANGED = 'partner_availability_changed',
  PARTNER_LOCATION_UPDATED = 'partner_location_updated',
  
  // General notifications
  NOTIFICATION = 'notification',
  
  // Real-time updates
  ORDERS_UPDATED = 'orders_updated',
  PARTNERS_UPDATED = 'partners_updated'
}

// Room names
export enum SocketRooms {
  MANAGERS = 'managers',
  DELIVERY_PARTNERS = 'delivery_partners',
  ALL_USERS = 'all_users'
}