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
  NotificationEvent
} from '../types/socket.types';

export class SocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, SocketUser> = new Map();

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? ['productiondomain.com']
          : ['http://localhost:3000'],
        credentials: true
      }
    });

    this.initializeSocketHandlers();
  }

  private initializeSocketHandlers() {
    this.io.use(this.authenticateSocket.bind(this));

    this.io.on(SocketEvents.CONNECT, (socket: Socket) => {
      console.log(`User connected: ${socket.id}`);
      this.handleConnection(socket);

      socket.on(SocketEvents.DISCONNECT, () => {
        this.handleDisconnection(socket);
      });

      socket.on(SocketEvents.JOIN_ROOM, (roomName: string) => {
        this.handleJoinRoom(socket, roomName);
      });

      socket.on(SocketEvents.LEAVE_ROOM, (roomName: string) => {
        this.handleLeaveRoom(socket, roomName);
      });
    });
  }

  private async authenticateSocket(socket: Socket, next: (err?: Error) => void) {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
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
      isOnline: true
    };
    
    this.connectedUsers.set(socket.id, socketUser);

    // Auto-join user to appropriate rooms
    if (user.role === UserRole.MANAGER) {
      socket.join(SocketRooms.MANAGERS);
    } else if (user.role === UserRole.DELIVERY) {
      socket.join(SocketRooms.DELIVERY_PARTNERS);
    }
    
    socket.join(SocketRooms.ALL_USERS);

    // Notify about user connection
    this.emitNotification({
      type: 'info',
      title: 'User Connected',
      message: `${user.role} connected`,
      recipient: user.userId
    });

    console.log(`${user.role} ${user.userId} joined appropriate rooms`);
  }

  private handleDisconnection(socket: Socket) {
    const user = this.connectedUsers.get(socket.id);
    if (user) {
      console.log(`User disconnected: ${user.userId}`);
      this.connectedUsers.delete(socket.id);
    }
  }

  private handleJoinRoom(socket: Socket, roomName: string) {
    socket.join(roomName);
    console.log(`Socket ${socket.id} joined room: ${roomName}`);
  }

  private handleLeaveRoom(socket: Socket, roomName: string) {
    socket.leave(roomName);
    console.log(`Socket ${socket.id} left room: ${roomName}`);
  }

  // Event emission methods
  public emitOrderCreated(event: OrderCreatedEvent) {
    this.io.to(SocketRooms.MANAGERS).emit(SocketEvents.ORDER_CREATED, event);
    this.io.to(SocketRooms.ALL_USERS).emit(SocketEvents.ORDERS_UPDATED);
    
    console.log('Order created event emitted:', event.order.orderId);
  }

  public emitOrderAssigned(event: OrderAssignedEvent) {
    // Notify managers
    this.io.to(SocketRooms.MANAGERS).emit(SocketEvents.ORDER_ASSIGNED, event);
    
    // Notify specific delivery partner
    this.emitToUser(event.partnerId, SocketEvents.ORDER_ASSIGNED, event);
    
    // Update all clients
    this.io.to(SocketRooms.ALL_USERS).emit(SocketEvents.ORDERS_UPDATED);
    this.io.to(SocketRooms.MANAGERS).emit(SocketEvents.PARTNERS_UPDATED);

    console.log('Order assigned event emitted:', event.orderId, 'to', event.partnerId);
  }

  public emitStatusUpdated(event: StatusUpdatedEvent) {
    // Notify all managers
    this.io.to(SocketRooms.MANAGERS).emit(SocketEvents.ORDER_STATUS_UPDATED, event);
    
    // Notify all delivery partners for their orders
    this.io.to(SocketRooms.DELIVERY_PARTNERS).emit(SocketEvents.ORDER_STATUS_UPDATED, event);
    
    // Update order lists
    this.io.to(SocketRooms.ALL_USERS).emit(SocketEvents.ORDERS_UPDATED);

    console.log('Status updated event emitted:', event.orderId, event.oldStatus, '->', event.newStatus);
  }

  public emitPartnerAvailabilityChanged(event: PartnerAvailabilityEvent) {
    // Notify managers about partner availability
    this.io.to(SocketRooms.MANAGERS).emit(SocketEvents.PARTNER_AVAILABILITY_CHANGED, event);
    
    // Update partner lists
    this.io.to(SocketRooms.MANAGERS).emit(SocketEvents.PARTNERS_UPDATED);

    console.log('Partner availability changed:', event.partnerId, event.isAvailable);
  }

  public emitPartnerLocationUpdated(event: PartnerLocationEvent) {
    // Notify managers about partner location
    this.io.to(SocketRooms.MANAGERS).emit(SocketEvents.PARTNER_LOCATION_UPDATED, event);

    console.log('Partner location updated:', event.partnerId);
  }

  public emitNotification(notification: NotificationEvent) {
    if (notification.recipient) {
      // Send to specific user
      this.emitToUser(notification.recipient, SocketEvents.NOTIFICATION, notification);
    } else {
      // Broadcast to all users
      this.io.to(SocketRooms.ALL_USERS).emit(SocketEvents.NOTIFICATION, notification);
    }

    console.log('Notification emitted:', notification.title);
  }

  private emitToUser(userId: string, event: string, data: any) {
    // Find user's socket
    for (const [socketId, user] of this.connectedUsers.entries()) {
      if (user.userId === userId) {
        this.io.to(socketId).emit(event, data);
        break;
      }
    }
  }

  // Utility methods
  public getConnectedUsers(): SocketUser[] {
    return Array.from(this.connectedUsers.values());
  }

  public getConnectedUsersByRole(role: UserRole): SocketUser[] {
    return Array.from(this.connectedUsers.values()).filter(user => user.role === role);
  }

  public isUserOnline(userId: string): boolean {
    return Array.from(this.connectedUsers.values()).some(user => user.userId === userId);
  }

  public getIO(): SocketIOServer {
    return this.io;
  }
}

// Singleton instance
let socketService: SocketService | null = null;

export const initializeSocketService = (server: HTTPServer): SocketService => {
  if (!socketService) {
    socketService = new SocketService(server);
  }
  return socketService;
};

export const getSocketService = (): SocketService => {
  if (!socketService) {
    throw new Error('Socket service not initialized. Call initializeSocketService first.');
  }
  return socketService;
};