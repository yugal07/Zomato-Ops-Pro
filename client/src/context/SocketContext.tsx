// client/src/context/SocketContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import useSocket from '../hooks/useSocket';

interface SocketContextType {
  // Connection state
  connected: boolean;
  connecting: boolean;
  error: string | null;
  reconnectAttempt: number;
  
  // Socket methods
  emit: (event: string, data?: any) => boolean;
  subscribeToOrderTracking: (orderId: string) => boolean;
  unsubscribeFromOrderTracking: (orderId: string) => boolean;
  updatePartnerStatus: (status: 'available' | 'busy' | 'offline' | 'on_break', message?: string) => boolean;
  
  // Location tracking
  startLocationTracking: () => void;
  stopLocationTracking: () => void;
  isLocationTracking: boolean;
  
  // Notifications
  notifications: any[];
  unreadNotifications: any[];
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Real-time data
  realtimeData: any;
  clearRealtimeFlags: () => void;
  
  // Utility methods
  refreshOrders: () => void;
  refreshPartners: () => void;
  refreshMetrics: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { authState } = useAuth();
  const [refreshTriggers, setRefreshTriggers] = useState({
    orders: 0,
    partners: 0,
    metrics: 0
  });

  const {
    connected,
    connecting,
    error,
    reconnectAttempt,
    emit,
    subscribeToOrderTracking,
    unsubscribeFromOrderTracking,
    updatePartnerStatus,
    startLocationTracking,
    stopLocationTracking,
    isLocationTracking,
    notifications,
    unreadNotifications,
    markNotificationAsRead,
    clearAllNotifications,
    realtimeData,
    clearRealtimeFlags
  } = useSocket({
    autoConnect: true,
    enableLocationTracking: authState.user?.role === 'delivery',
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  });

  // Utility methods to trigger refreshes
  const refreshOrders = () => {
    setRefreshTriggers(prev => ({ ...prev, orders: prev.orders + 1 }));
    clearRealtimeFlags();
  };

  const refreshPartners = () => {
    setRefreshTriggers(prev => ({ ...prev, partners: prev.partners + 1 }));
    clearRealtimeFlags();
  };

  const refreshMetrics = () => {
    setRefreshTriggers(prev => ({ ...prev, metrics: prev.metrics + 1 }));
    clearRealtimeFlags();
  };

  // Auto-trigger refreshes based on real-time data
  useEffect(() => {
    if (realtimeData.ordersNeedRefresh) {
      const timer = setTimeout(refreshOrders, 100); // Small delay to batch updates
      return () => clearTimeout(timer);
    }
  }, [realtimeData.ordersNeedRefresh]);

  useEffect(() => {
    if (realtimeData.partnersNeedRefresh) {
      const timer = setTimeout(refreshPartners, 100);
      return () => clearTimeout(timer);
    }
  }, [realtimeData.partnersNeedRefresh]);

  const contextValue: SocketContextType = {
    // Connection state
    connected,
    connecting,
    error,
    reconnectAttempt,
    
    // Socket methods
    emit,
    subscribeToOrderTracking,
    unsubscribeFromOrderTracking,
    updatePartnerStatus,
    
    // Location tracking
    startLocationTracking,
    stopLocationTracking,
    isLocationTracking,
    
    // Notifications
    notifications,
    unreadNotifications,
    markNotificationAsRead,
    clearAllNotifications,
    
    // Real-time data
    realtimeData,
    clearRealtimeFlags,
    
    // Utility methods
    refreshOrders,
    refreshPartners,
    refreshMetrics
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;