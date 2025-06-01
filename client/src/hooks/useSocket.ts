// client/src/hooks/useSocket.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

// Socket event types (should match server types)
export interface SocketEvents {
  // Connection events
  connect: () => void;
  disconnect: () => void;
  
  // Order events
  order_created: (data: any) => void;
  order_assigned: (data: any) => void;
  order_status_updated: (data: any) => void;
  new_order_available: (data: any) => void;
  orders_updated: () => void;
  
  // Partner events
  partner_availability_changed: (data: any) => void;
  partner_location_updated: (data: any) => void;
  partner_status_update: (data: any) => void;
  partner_online_status: (data: any) => void;
  partners_updated: () => void;
  
  // Notifications
  notification: (data: any) => void;
  system_update: (data: any) => void;
  
  // Real-time updates
  real_time_update: (data: any) => void;
  metrics_updated: (data: any) => void;
}

export interface UseSocketOptions {
  autoConnect?: boolean;
  enableLocationTracking?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
}

export interface SocketState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  reconnectAttempt: number;
  lastConnected: Date | null;
}

export interface RealtimeData {
  lastOrderCreated?: any;
  lastOrderAssigned?: any;
  lastStatusUpdate?: any;
  lastPartnerUpdate?: any;
  partnerLocations?: Record<string, any>;
  partnerStatuses?: Record<string, boolean>;
  metrics?: any;
  metricsLastUpdated?: Date;
  ordersNeedRefresh?: boolean;
  partnersNeedRefresh?: boolean;
  lastUpdate?: Date;
  [key: string]: any;
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const {
    autoConnect = true,
    enableLocationTracking = false,
    reconnectionAttempts = 5,
    reconnectionDelay = 1000
  } = options;

  const { authState } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const locationWatchId = useRef<number | undefined>(undefined);

  const [socketState, setSocketState] = useState<SocketState>({
    connected: false,
    connecting: false,
    error: null,
    reconnectAttempt: 0,
    lastConnected: null
  });

  const [notifications, setNotifications] = useState<any[]>([]);
  const [realtimeData, setRealtimeData] = useState<RealtimeData>({});

  // Socket connection
  const connect = useCallback(() => {
    if (!authState.isAuthenticated || !authState.token || socketRef.current?.connected) {
      return;
    }

    setSocketState(prev => ({ ...prev, connecting: true, error: null }));

    const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      auth: {
        token: authState.token
      },
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 10000,
      forceNew: true
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      setSocketState({
        connected: true,
        connecting: false,
        error: null,
        reconnectAttempt: 0,
        lastConnected: new Date()
      });

      // Start location tracking if enabled and user is delivery partner
      if (enableLocationTracking && authState.user?.role === 'delivery') {
        startLocationTracking();
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setSocketState(prev => ({
        ...prev,
        connected: false,
        connecting: false,
        error: reason === 'io server disconnect' ? 'Server disconnected' : null
      }));

      stopLocationTracking();

      // Attempt reconnection for certain disconnect reasons
      if (reason === 'io server disconnect' || reason === 'transport close') {
        attemptReconnection();
      }
    });

    socket.on('connect_error', (error) => {
      console.error('🔴 Socket connection error:', error);
      setSocketState(prev => ({
        ...prev,
        connected: false,
        connecting: false,
        error: error.message || 'Connection failed'
      }));

      attemptReconnection();
    });

    // Set up event listeners for real-time updates
    setupEventListeners(socket);

  }, [authState.isAuthenticated, authState.token, authState.user?.role, enableLocationTracking]);

  // Reconnection logic
  const attemptReconnection = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    setSocketState(prev => {
      if (prev.reconnectAttempt >= reconnectionAttempts) {
        return {
          ...prev,
          error: 'Max reconnection attempts reached'
        };
      }

      const nextAttempt = prev.reconnectAttempt + 1;
      const delay = reconnectionDelay * Math.pow(2, nextAttempt - 1); // Exponential backoff

      console.log(`🔄 Attempting reconnection ${nextAttempt}/${reconnectionAttempts} in ${delay}ms`);

      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, delay);

      return {
        ...prev,
        reconnectAttempt: nextAttempt,
        connecting: true
      };
    });
  }, [reconnectionAttempts, reconnectionDelay, connect]);

  // Set up event listeners
  const setupEventListeners = useCallback((socket: Socket) => {
    // Order events
    socket.on('order_created', (data) => {
      console.log('📦 New order created:', data);
      setRealtimeData(prev => ({
        ...prev,
        lastOrderCreated: data,
        ordersNeedRefresh: true
      }));
      
      if (authState.user?.role === 'delivery') {
        addNotification({
          type: 'info',
          title: 'New Order Available',
          message: `Order ${data.order?.orderId} is available for pickup`,
          timestamp: new Date()
        });
      }
    });

    socket.on('order_assigned', (data) => {
      console.log('🚚 Order assigned:', data);
      setRealtimeData(prev => ({
        ...prev,
        lastOrderAssigned: data,
        ordersNeedRefresh: true
      }));

      if (authState.user?._id === data.partnerId) {
        addNotification({
          type: 'success',
          title: 'Order Assigned',
          message: `You've been assigned order ${data.orderId}`,
          timestamp: new Date()
        });
      }
    });

    socket.on('order_status_updated', (data) => {
      console.log('🔄 Order status updated:', data);
      setRealtimeData(prev => ({
        ...prev,
        lastStatusUpdate: data,
        ordersNeedRefresh: true
      }));
    });

    socket.on('new_order_available', (data) => {
      console.log('🆕 New order available for delivery:', data);
      if (authState.user?.role === 'delivery') {
        addNotification({
          type: 'info',
          title: 'New Order Available',
          message: `Order ${data.orderId} - ${data.itemCount} items (${data.prepTime}min prep)`,
          timestamp: new Date(),
          actionUrl: '/delivery/orders',
          actionText: 'View Orders'
        });
      }
    });

    // Partner events
    socket.on('partner_availability_changed', (data) => {
      console.log('🟢 Partner availability changed:', data);
      setRealtimeData(prev => ({
        ...prev,
        lastPartnerUpdate: data,
        partnersNeedRefresh: true
      }));
    });

    socket.on('partner_location_updated', (data) => {
      console.log('📍 Partner location updated:', data);
      setRealtimeData(prev => ({
        ...prev,
        partnerLocations: {
          ...prev.partnerLocations,
          [data.partnerId]: data.location
        }
      }));
    });

    socket.on('partner_online_status', (data) => {
      console.log('👤 Partner online status changed:', data);
      setRealtimeData(prev => ({
        ...prev,
        partnerStatuses: {
          ...prev.partnerStatuses,
          [data.userId]: data.isOnline
        }
      }));
    });

    // General updates
    socket.on('orders_updated', () => {
      console.log('📋 Orders list needs refresh');
      setRealtimeData(prev => ({
        ...prev,
        ordersNeedRefresh: true
      }));
    });

    socket.on('partners_updated', () => {
      console.log('👥 Partners list needs refresh');
      setRealtimeData(prev => ({
        ...prev,
        partnersNeedRefresh: true
      }));
    });

    socket.on('metrics_updated', (data) => {
      console.log('📊 Metrics updated:', data);
      setRealtimeData(prev => ({
        ...prev,
        metrics: data,
        metricsLastUpdated: new Date()
      }));
    });

    // Notifications
    socket.on('notification', (notification) => {
      console.log('🔔 Notification received:', notification);
      addNotification({
        ...notification,
        timestamp: new Date()
      });
    });

    socket.on('system_update', (update) => {
      console.log('🚨 System update:', update);
      addNotification({
        type: update.severity === 'high' ? 'error' : 'warning',
        title: update.title,
        message: update.message,
        timestamp: new Date(),
        persistent: update.severity === 'high'
      });
    });

    // Real-time data updates
    socket.on('real_time_update', (data) => {
      console.log('⚡ Real-time update:', data);
      setRealtimeData(prev => ({
        ...prev,
        [data.type]: data.data,
        lastUpdate: new Date()
      }));
    });

  }, [authState.user?._id, authState.user?.role]);

  // Location tracking
  const startLocationTracking = useCallback(() => {
    if (!navigator.geolocation || locationWatchId.current) {
      return;
    }

    console.log('📍 Starting location tracking');

    locationWatchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        };

        // Emit location update to server
        if (socketRef.current?.connected) {
          socketRef.current.emit('location_update', location);
        }
      },
      (error) => {
        console.error('Location tracking error:', error);
        addNotification({
          type: 'warning',
          title: 'Location Access',
          message: 'Unable to track location. Please enable location services.',
          timestamp: new Date()
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  }, []);

  const stopLocationTracking = useCallback(() => {
    if (locationWatchId.current) {
      navigator.geolocation.clearWatch(locationWatchId.current);
      locationWatchId.current = undefined;
      console.log('📍 Stopped location tracking');
    }
  }, []);

  // Notification management
  const addNotification = useCallback((notification: any) => {
    const id = Date.now().toString();
    setNotifications(prev => [{
      ...notification,
      id,
      read: false
    }, ...prev.slice(0, 49)]); // Keep last 50 notifications

    // Auto-remove non-persistent notifications after delay
    if (!notification.persistent) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.autoClose || 5000);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Socket utility functions
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    stopLocationTracking();
    
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    setSocketState({
      connected: false,
      connecting: false,
      error: null,
      reconnectAttempt: 0,
      lastConnected: null
    });
  }, [stopLocationTracking]);

  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
      return true;
    }
    console.warn('Cannot emit event - socket not connected:', event);
    return false;
  }, []);

  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
      return () => socketRef.current?.off(event, callback);
    }
    return () => {};
  }, []);

  const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  }, []);

  // Subscribe to order tracking
  const subscribeToOrderTracking = useCallback((orderId: string) => {
    return emit('subscribe_order_tracking', orderId);
  }, [emit]);

  const unsubscribeFromOrderTracking = useCallback((orderId: string) => {
    return emit('unsubscribe_order_tracking', orderId);
  }, [emit]);

  // Update partner status
  const updatePartnerStatus = useCallback((status: 'available' | 'busy' | 'offline' | 'on_break', message?: string) => {
    if (authState.user?.role !== 'delivery') {
      console.warn('Only delivery partners can update their status');
      return false;
    }
    
    return emit('partner_status_update', { status, message });
  }, [emit, authState.user?.role]);

  // Clear realtime data flags
  const clearRealtimeFlags = useCallback(() => {
    setRealtimeData(prev => ({
      ...prev,
      ordersNeedRefresh: false,
      partnersNeedRefresh: false
    }));
  }, []);

  // Effects
  useEffect(() => {
    if (autoConnect && authState.isAuthenticated && authState.token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, authState.isAuthenticated, authState.token, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    // Connection state
    ...socketState,
    socket: socketRef.current,
    
    // Connection methods
    connect,
    disconnect,
    
    // Event methods
    emit,
    on,
    off,
    
    // Specialized methods
    subscribeToOrderTracking,
    unsubscribeFromOrderTracking,
    updatePartnerStatus,
    
    // Location tracking
    startLocationTracking,
    stopLocationTracking,
    isLocationTracking: !!locationWatchId.current,
    
    // Notifications
    notifications,
    unreadNotifications: notifications.filter(n => !n.read),
    addNotification,
    removeNotification,
    markNotificationAsRead,
    clearAllNotifications,
    
    // Real-time data
    realtimeData,
    clearRealtimeFlags
  };
};

export default useSocket;