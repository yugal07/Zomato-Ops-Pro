// server/src/types/socket.types.ts
import { OrderStatus } from './order.types';
import { UserRole } from './auth.types';

export interface SocketUser {
  userId: string;
  role: UserRole;
  socketId: string;
  isOnline: boolean;
  connectedAt: Date;
}

// Order related events
export interface OrderCreatedEvent {
  order: {
    _id: string;
    orderId: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    prepTime: number;
    status: OrderStatus;
    createdBy: {
      name: string;
      email: string;
    };
    createdAt: Date;
  };
  message: string;
}

export interface OrderAssignedEvent {
  orderId: string;
  partnerId: string;
  partnerName: string;
  dispatchTime: Date;
  estimatedDeliveryTime?: Date;
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
  location?: {
    lat: number;
    lng: number;
  };
}

// Partner related events
export interface PartnerAvailabilityEvent {
  partnerId: string;
  partnerName: string;
  isAvailable: boolean;
  currentOrdersCount: number;
  location?: {
    lat: number;
    lng: number;
  };
  message: string;
}

export interface PartnerLocationEvent {
  partnerId: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  timestamp: Date;
  accuracy?: number;
}

export interface PartnerStatusEvent {
  status: 'available' | 'busy' | 'offline' | 'on_break';
  message?: string;
  estimatedReturnTime?: Date;
}

// Notification events
export interface NotificationEvent {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  recipient?: string; // specific user ID, if empty - broadcast
  data?: any;
  persistent?: boolean;
  autoClose?: number; // milliseconds
  actionUrl?: string;
  actionText?: string;
}

// Real-time update events
export interface RealTimeUpdateEvent {
  type: 'metrics_update' | 'system_status' | 'data_refresh' | 'user_activity';
  data: any;
  targetRole?: UserRole;
  timestamp: Date;
}

// Order tracking events
export interface OrderTrackingEvent {
  orderId: string;
  status: OrderStatus;
  location?: {
    lat: number;
    lng: number;
  };
  timestamp: Date;
  message: string;
  estimatedDeliveryTime?: Date;
  partnerName?: string;
}

// New order availability event
export interface NewOrderAvailableEvent {
  orderId: string;
  prepTime: number;
  itemCount: number;
  estimatedDistance?: number;
  priority: 'low' | 'medium' | 'high';
  message: string;
}

// System events
export interface SystemUpdateEvent {
  type: 'maintenance' | 'announcement' | 'emergency';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
  actionRequired?: boolean;
}

// Connection events
export interface UserConnectionEvent {
  userId: string;
  role: UserRole;
  isOnline: boolean;
  timestamp: Date;
  deviceInfo?: {
    userAgent: string;
    platform: string;
  };
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
  ORDER_TRACKING_UPDATE = 'order_tracking_update',
  NEW_ORDER_AVAILABLE = 'new_order_available',
  
  // Partner events
  PARTNER_AVAILABILITY_CHANGED = 'partner_availability_changed',
  PARTNER_LOCATION_UPDATED = 'partner_location_updated',
  PARTNER_STATUS_UPDATE = 'partner_status_update',
  PARTNER_ONLINE_STATUS = 'partner_online_status',
  
  // Location events
  LOCATION_UPDATE = 'location_update',
  LOCATION_REQUEST = 'location_request',
  
  // Order tracking subscription
  SUBSCRIBE_ORDER_TRACKING = 'subscribe_order_tracking',
  UNSUBSCRIBE_ORDER_TRACKING = 'unsubscribe_order_tracking',
  
  // General notifications
  NOTIFICATION = 'notification',
  SYSTEM_UPDATE = 'system_update',
  
  // Real-time updates
  ORDERS_UPDATED = 'orders_updated',
  PARTNERS_UPDATED = 'partners_updated',
  METRICS_UPDATED = 'metrics_updated',
  REAL_TIME_UPDATE = 'real_time_update',
  
  // User activity
  USER_CONNECTED = 'user_connected',
  USER_DISCONNECTED = 'user_disconnected',
  USER_STATUS_CHANGED = 'user_status_changed',
  
  // Chat and communication
  DIRECT_MESSAGE = 'direct_message',
  BROADCAST_MESSAGE = 'broadcast_message',
  
  // Emergency events
  EMERGENCY_ALERT = 'emergency_alert',
  SOS_REQUEST = 'sos_request'
}

// Room names for Socket.IO
export enum SocketRooms {
  // Role-based rooms
  MANAGERS = 'managers',
  DELIVERY_PARTNERS = 'delivery_partners',
  ALL_USERS = 'all_users',
  
  // Admin and system rooms
  ADMIN_UPDATES = 'admin_updates',
  PARTNER_UPDATES = 'partner_updates',
  SYSTEM_MONITORS = 'system_monitors',
  
  // Location-based rooms (can be dynamically created)
  LOCATION_ZONE_PREFIX = 'zone_', // e.g., zone_mumbai_central
  
  // Order-specific rooms (dynamically created)
  ORDER_TRACKING_PREFIX = 'order_tracking_', // e.g., order_tracking_ORD123456
  
  // Priority channels
  EMERGENCY_CHANNEL = 'emergency_channel',
  PRIORITY_ALERTS = 'priority_alerts'
}

// WebSocket connection states
export enum ConnectionState {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  DISCONNECTED = 'disconnected',
  ERROR = 'error'
}

// Partner activity states
export enum PartnerActivityState {
  ACTIVE = 'active',
  IDLE = 'idle',
  BUSY = 'busy',
  OFFLINE = 'offline',
  ON_BREAK = 'on_break',
  EMERGENCY = 'emergency'
}

// Message types for chat/communication
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientId?: string; // For direct messages
  message: string;
  timestamp: Date;
  type: 'text' | 'system' | 'alert' | 'location';
  orderId?: string; // If message is related to specific order
  readBy: string[]; // User IDs who have read the message
}

// Socket middleware data
export interface SocketAuthData {
  token: string;
  userId: string;
  role: UserRole;
  deviceInfo?: {
    userAgent: string;
    platform: string;
    version: string;
  };
}

// Error events
export interface SocketErrorEvent {
  type: 'authentication' | 'authorization' | 'rate_limit' | 'server_error';
  message: string;
  code?: string;
  timestamp: Date;
}