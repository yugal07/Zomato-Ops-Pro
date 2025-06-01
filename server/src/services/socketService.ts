// server/src/services/socketService.ts
import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { authConfig } from '../config/auth';
import { JWTPayload, UserRole } from '../types/auth.types';
import { 
  SocketEvents, 
  SocketRooms, 
  SocketUser,
  OrderCreatedEvent,
  OrderAssignedEvent,
  StatusUpdatedEvent,
  PartnerAvailabilityEvent,
  PartnerLocationEvent,
  NotificationEvent,
  RealTimeUpdateEvent,
  PartnerStatusEvent
} from '../types/socket.types';

export class SocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, SocketUser> = new Map();
  private userSockets: Map<string, string[]> = new Map(); // userId -> socketIds[]

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? ['productionDomain.com']
          : ['http://localhost:3000'],
        credentials: true,
        methods: ['GET', 'POST']
      },
      transports: ['websocket', 'polling']
    });

    this.initializeSocketHandlers();
    console.log('🔌 Socket.IO service initialized');
  }

  private initializeSocketHandlers() {
    // Authentication middleware
    this.io.use(this.authenticateSocket.bind(this));

    this.io.on(SocketEvents.CONNECT, (socket: Socket) => {
      console.log(`✅ User connected: ${socket.id}`);
      this.handleConnection(socket);

      // Connection event handlers
      socket.on(SocketEvents.DISCONNECT, () => {
        this.handleDisconnection(socket);
      });

      socket.on(SocketEvents.JOIN_ROOM, (roomName: string) => {
        this.handleJoinRoom(socket, roomName);
      });

      socket.on(SocketEvents.LEAVE_ROOM, (roomName: string) => {
        this.handleLeaveRoom(socket, roomName);
      });

      // Delivery partner specific events
      socket.on(SocketEvents.PARTNER_STATUS_UPDATE, (data: PartnerStatusEvent) => {
        this.handlePartnerStatusUpdate(socket, data);
      });

      socket.on(SocketEvents.LOCATION_UPDATE, (location: { lat: number; lng: number }) => {
        this.handleLocationUpdate(socket, location);
      });

      // Order tracking events
      socket.on(SocketEvents.SUBSCRIBE_ORDER_TRACKING, (orderId: string) => {
        this.handleSubscribeOrderTracking(socket, orderId);
      });

      socket.on(SocketEvents.UNSUBSCRIBE_ORDER_TRACKING, (orderId: string) => {
        this.handleUnsubscribeOrderTracking(socket, orderId);
      });

      // Heartbeat for connection monitoring
      socket.on('ping', () => {
        socket.emit('pong');
      });
    });
  }

  private async authenticateSocket(socket: Socket, next: (err?: Error) => void) {
    try {
      const token = socket.handshake.auth.token || 
                   socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, authConfig.jwtSecret) as JWTPayload;
      
      // Attach user info to socket
      (socket as any).user = decoded;
      next();
    } catch (error) {
      next(new Error('Invalid authentication token'));
    }
  }

  private handleConnection(socket: Socket) {
    const user = (socket as any).user as JWTPayload;
    
    // Store connected user
    const socketUser: SocketUser = {
      userId: user.userId,
      role: user.role,
      socketId: socket.id,
      isOnline: true,
      connectedAt: new Date()
    };
    
    this.connectedUsers.set(socket.id, socketUser);

    // Track multiple connections for same user
    if (!this.userSockets.has(user.userId)) {
      this.userSockets.set(user.userId, []);
    }
    this.userSockets.get(user.userId)!.push(socket.id);

    // Auto-join user to appropriate rooms
    this.joinUserRooms(socket, user);

    // Notify about user connection
    this.emitUserStatusChanged({
      userId: user.userId,
      isOnline: true,
      role: user.role,
      timestamp: new Date()
    });

    console.log(`👤 ${user.role} ${user.userId} connected (socket: ${socket.id})`);
  }

  private joinUserRooms(socket: Socket, user: JWTPayload) {
    // Join role-based rooms
    if (user.role === UserRole.MANAGER) {
      socket.join(SocketRooms.MANAGERS);
      socket.join(SocketRooms.ADMIN_UPDATES); // For system-wide updates
    } else if (user.role === UserRole.DELIVERY) {
      socket.join(SocketRooms.DELIVERY_PARTNERS);
      socket.join(SocketRooms.PARTNER_UPDATES);
    }
    
    // Join general rooms
    socket.join(SocketRooms.ALL_USERS);
    socket.join(`user_${user.userId}`); // Personal room for direct messaging

    console.log(`🏠 User ${user.userId} joined rooms for role: ${user.role}`);
  }

  private handleDisconnection(socket: Socket) {
    const user = this.connectedUsers.get(socket.id);
    if (user) {
      console.log(`❌ User disconnected: ${user.userId} (socket: ${socket.id})`);
      
      // Remove from connected users
      this.connectedUsers.delete(socket.id);

      // Remove from user sockets tracking
      const userSocketIds = this.userSockets.get(user.userId);
      if (userSocketIds) {
        const index = userSocketIds.indexOf(socket.id);
        if (index > -1) {
          userSocketIds.splice(index, 1);
          
          // If no more connections for this user, mark as offline
          if (userSocketIds.length === 0) {
            this.userSockets.delete(user.userId);
            this.emitUserStatusChanged({
              userId: user.userId,
              isOnline: false,
              role: user.role,
              timestamp: new Date()
            });
          }
        }
      }
    }
  }

  private handleJoinRoom(socket: Socket, roomName: string) {
    socket.join(roomName);
    console.log(`🔗 Socket ${socket.id} joined room: ${roomName}`);
  }

  private handleLeaveRoom(socket: Socket, roomName: string) {
    socket.leave(roomName);
    console.log(`🔌 Socket ${socket.id} left room: ${roomName}`);
  }

  private handlePartnerStatusUpdate(socket: Socket, data: PartnerStatusEvent) {
    const user = (socket as any).user as JWTPayload;
    
    if (user.role !== UserRole.DELIVERY) {
      return; // Only delivery partners can update their status
    }

    // Emit to managers
    this.io.to(SocketRooms.MANAGERS).emit(SocketEvents.PARTNER_STATUS_UPDATE, {
      ...data,
      partnerId: user.userId,
      timestamp: new Date()
    });

    console.log(`📱 Partner ${user.userId} status update:`, data);
  }

  private handleLocationUpdate(socket: Socket, location: { lat: number; lng: number }) {
    const user = (socket as any).user as JWTPayload;
    
    if (user.role !== UserRole.DELIVERY) {
      return; // Only delivery partners can update location
    }

    const locationEvent: PartnerLocationEvent = {
      partnerId: user.userId,
      location: location,
      timestamp: new Date()
    };

    // Emit to managers
    this.io.to(SocketRooms.MANAGERS).emit(SocketEvents.PARTNER_LOCATION_UPDATED, locationEvent);

    console.log(`📍 Partner ${user.userId} location updated:`, location);
  }

  private handleSubscribeOrderTracking(socket: Socket, orderId: string) {
    const roomName = `order_tracking_${orderId}`;
    socket.join(roomName);
    console.log(`👁️ Socket ${socket.id} subscribed to order tracking: ${orderId}`);
  }

  private handleUnsubscribeOrderTracking(socket: Socket, orderId: string) {
    const roomName = `order_tracking_${orderId}`;
    socket.leave(roomName);
    console.log(`👁️ Socket ${socket.id} unsubscribed from order tracking: ${orderId}`);
  }

  // Public event emission methods
  public emitOrderCreated(event: OrderCreatedEvent) {
    // Notify managers
    this.io.to(SocketRooms.MANAGERS).emit(SocketEvents.ORDER_CREATED, event);
    
    // Notify available delivery partners
    this.io.to(SocketRooms.DELIVERY_PARTNERS).emit(SocketEvents.NEW_ORDER_AVAILABLE, {
      orderId: event.order.orderId,
      prepTime: event.order.prepTime,
      itemCount: event.order.items.length,
      message: 'New order available for pickup'
    });
    
    // Update order lists
    this.io.to(SocketRooms.ALL_USERS).emit(SocketEvents.ORDERS_UPDATED);
    
    console.log('📦 Order created event emitted:', event.order.orderId);
  }

  public emitOrderAssigned(event: OrderAssignedEvent) {
    // Notify managers
    this.io.to(SocketRooms.MANAGERS).emit(SocketEvents.ORDER_ASSIGNED, event);
    
    // Notify specific delivery partner
    this.emitToUser(event.partnerId, SocketEvents.ORDER_ASSIGNED, event);
    
    // Update all clients
    this.io.to(SocketRooms.ALL_USERS).emit(SocketEvents.ORDERS_UPDATED);
    this.io.to(SocketRooms.MANAGERS).emit(SocketEvents.PARTNERS_UPDATED);

    console.log('🚚 Order assigned event emitted:', event.orderId, 'to', event.partnerId);
  }

  public emitStatusUpdated(event: StatusUpdatedEvent) {
    // Notify all managers
    this.io.to(SocketRooms.MANAGERS).emit(SocketEvents.ORDER_STATUS_UPDATED, event);
    
    // Notify delivery partners
    this.io.to(SocketRooms.DELIVERY_PARTNERS).emit(SocketEvents.ORDER_STATUS_UPDATED, event);
    
    // Notify order tracking subscribers
    const trackingRoom = `order_tracking_${event.orderId}`;
    this.io.to(trackingRoom).emit(SocketEvents.ORDER_TRACKING_UPDATE, {
      orderId: event.orderId,
      status: event.newStatus,
      timestamp: event.timestamp,
      message: event.message
    });
    
    // Update order lists
    this.io.to(SocketRooms.ALL_USERS).emit(SocketEvents.ORDERS_UPDATED);

    console.log('🔄 Status updated event emitted:', event.orderId, event.oldStatus, '->', event.newStatus);
  }

  public emitPartnerAvailabilityChanged(event: PartnerAvailabilityEvent) {
    // Notify managers
    this.io.to(SocketRooms.MANAGERS).emit(SocketEvents.PARTNER_AVAILABILITY_CHANGED, event);
    
    // Update partner lists
    this.io.to(SocketRooms.MANAGERS).emit(SocketEvents.PARTNERS_UPDATED);

    console.log('🟢 Partner availability changed:', event.partnerId, event.isAvailable);
  }

  public emitPartnerLocationUpdated(event: PartnerLocationEvent) {
    // Notify managers
    this.io.to(SocketRooms.MANAGERS).emit(SocketEvents.PARTNER_LOCATION_UPDATED, event);

    console.log('📍 Partner location updated:', event.partnerId);
  }

  public emitNotification(notification: NotificationEvent) {
    if (notification.recipient) {
      // Send to specific user
      this.emitToUser(notification.recipient, SocketEvents.NOTIFICATION, notification);
    } else {
      // Broadcast to all users
      this.io.to(SocketRooms.ALL_USERS).emit(SocketEvents.NOTIFICATION, notification);
    }

    console.log('🔔 Notification emitted:', notification.title);
  }

  public emitRealTimeUpdate(update: RealTimeUpdateEvent) {
    if (update.targetRole) {
      const room = update.targetRole === UserRole.MANAGER ? 
                   SocketRooms.MANAGERS : SocketRooms.DELIVERY_PARTNERS;
      this.io.to(room).emit(SocketEvents.REAL_TIME_UPDATE, update);
    } else {
      this.io.to(SocketRooms.ALL_USERS).emit(SocketEvents.REAL_TIME_UPDATE, update);
    }

    console.log('⚡ Real-time update emitted:', update.type);
  }

  private emitUserStatusChanged(event: {
    userId: string;
    isOnline: boolean;
    role: UserRole;
    timestamp: Date;
  }) {
    // Notify managers about delivery partner status changes
    if (event.role === UserRole.DELIVERY) {
      this.io.to(SocketRooms.MANAGERS).emit(SocketEvents.PARTNER_ONLINE_STATUS, event);
    }
    
    console.log(`👤 User ${event.userId} is now ${event.isOnline ? 'online' : 'offline'}`);
  }

  private emitToUser(userId: string, event: string, data: any) {
    const socketIds = this.userSockets.get(userId);
    if (socketIds) {
      socketIds.forEach(socketId => {
        this.io.to(socketId).emit(event, data);
      });
    }
  }

  // System monitoring methods
  public broadcastSystemUpdate(update: {
    type: 'maintenance' | 'announcement' | 'emergency';
    title: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
  }) {
    this.io.to(SocketRooms.ALL_USERS).emit(SocketEvents.SYSTEM_UPDATE, {
      ...update,
      timestamp: new Date()
    });

    console.log('🚨 System update broadcasted:', update.type);
  }

  // Utility methods
  public getConnectedUsers(): SocketUser[] {
    return Array.from(this.connectedUsers.values());
  }

  public getConnectedUsersByRole(role: UserRole): SocketUser[] {
    return Array.from(this.connectedUsers.values()).filter(user => user.role === role);
  }

  public isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId) && this.userSockets.get(userId)!.length > 0;
  }

  public getUserConnectionCount(userId: string): number {
    return this.userSockets.get(userId)?.length || 0;
  }

  public getConnectionStats() {
    const users = Array.from(this.connectedUsers.values());
    const managers = users.filter(u => u.role === UserRole.MANAGER);
    const deliveryPartners = users.filter(u => u.role === UserRole.DELIVERY);
    
    return {
      total: users.length,
      managers: managers.length,
      deliveryPartners: deliveryPartners.length,
      uniqueUsers: this.userSockets.size
    };
  }

  public getIO(): SocketIOServer {
    return this.io;
  }

  // Health check and monitoring
  public async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    connectedUsers: number;
    uptime: number;
    lastActivity: Date;
  }> {
    const stats = this.getConnectionStats();
    
    return {
      status: stats.total > 0 ? 'healthy' : 'degraded',
      connectedUsers: stats.total,
      uptime: process.uptime(),
      lastActivity: new Date()
    };
  }
}

// Singleton instance
let socketService: SocketService | null = null;

export const initializeSocketService = (server: HTTPServer): SocketService => {
  if (!socketService) {
    socketService = new SocketService(server);
    console.log('🚀 Socket service initialized successfully');
  }
  return socketService;
};

export const getSocketService = (): SocketService => {
  if (!socketService) {
    throw new Error('Socket service not initialized. Call initializeSocketService first.');
  }
  return socketService;
};