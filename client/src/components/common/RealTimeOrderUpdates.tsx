// client/src/components/common/RealTimeOrderUpdates.tsx
import React, { useEffect, useState } from 'react';
import { 
  Package, 
  AlertCircle,
  User,
  MapPin,
  Activity,
  RefreshCw,
  X
} from 'lucide-react';
import { useSocketContext } from '../../context/SocketContext';

interface RealTimeOrderUpdatesProps {
  onOrdersUpdate?: () => void;
  showToasts?: boolean;
  className?: string;
}

interface OrderUpdate {
  id: string;
  type: 'created' | 'assigned' | 'status_updated' | 'location_updated';
  orderId: string;
  message: string;
  timestamp: Date;
  data: any;
}

const RealTimeOrderUpdates: React.FC<RealTimeOrderUpdatesProps> = ({
  onOrdersUpdate,
  showToasts = true,
  className = ''
}) => {
  const [recentUpdates, setRecentUpdates] = useState<OrderUpdate[]>([]);
  const [showUpdatesList, setShowUpdatesList] = useState(false);
  
  const { realtimeData, connected, emit } = useSocketContext();

  // Handle real-time order updates
  useEffect(() => {
    if (realtimeData.lastOrderCreated) {
      const update: OrderUpdate = {
        id: `created_${Date.now()}`,
        type: 'created',
        orderId: realtimeData.lastOrderCreated.order?.orderId || 'Unknown',
        message: `New order created: ${realtimeData.lastOrderCreated.order?.orderId}`,
        timestamp: new Date(),
        data: realtimeData.lastOrderCreated
      };
      addUpdate(update);
      onOrdersUpdate?.();
    }
  }, [realtimeData.lastOrderCreated, onOrdersUpdate]);

  useEffect(() => {
    if (realtimeData.lastOrderAssigned) {
      const update: OrderUpdate = {
        id: `assigned_${Date.now()}`,
        type: 'assigned',
        orderId: realtimeData.lastOrderAssigned.orderId,
        message: `Order ${realtimeData.lastOrderAssigned.orderId} assigned to ${realtimeData.lastOrderAssigned.partnerName}`,
        timestamp: new Date(),
        data: realtimeData.lastOrderAssigned
      };
      addUpdate(update);
      onOrdersUpdate?.();
    }
  }, [realtimeData.lastOrderAssigned, onOrdersUpdate]);

  useEffect(() => {
    if (realtimeData.lastStatusUpdate) {
      const update: OrderUpdate = {
        id: `status_${Date.now()}`,
        type: 'status_updated',
        orderId: realtimeData.lastStatusUpdate.orderId,
        message: `Order ${realtimeData.lastStatusUpdate.orderId} status: ${realtimeData.lastStatusUpdate.oldStatus} → ${realtimeData.lastStatusUpdate.newStatus}`,
        timestamp: new Date(),
        data: realtimeData.lastStatusUpdate
      };
      addUpdate(update);
      onOrdersUpdate?.();
    }
  }, [realtimeData.lastStatusUpdate, onOrdersUpdate]);

  const addUpdate = (update: OrderUpdate) => {
    setRecentUpdates(prev => [update, ...prev.slice(0, 9)]); // Keep last 10 updates
    
    // Auto-remove update after 30 seconds
    setTimeout(() => {
      setRecentUpdates(prev => prev.filter(u => u.id !== update.id));
    }, 30000);
  };

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'created':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'assigned':
        return <User className="h-4 w-4 text-green-500" />;
      case 'status_updated':
        return <Activity className="h-4 w-4 text-purple-500" />;
      case 'location_updated':
        return <MapPin className="h-4 w-4 text-orange-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getUpdateColor = (type: string) => {
    switch (type) {
      case 'created':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'assigned':
        return 'border-l-green-500 bg-green-50 dark:bg-green-900/20';
      case 'status_updated':
        return 'border-l-purple-500 bg-purple-50 dark:bg-purple-900/20';
      case 'location_updated':
        return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20';
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);

    if (diffInSeconds < 10) return 'Just now';
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  };

  const requestDataRefresh = () => {
    emit('request_data_refresh');
    onOrdersUpdate?.();
  };

  if (!connected && recentUpdates.length === 0) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Connection Status & Activity Indicator */}
      <div className="flex items-center space-x-2">
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm ${
          connected 
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          }`} />
          <span>{connected ? 'Live Updates' : 'Disconnected'}</span>
        </div>

        {recentUpdates.length > 0 && (
          <button
            onClick={() => setShowUpdatesList(!showUpdatesList)}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
          >
            <Activity className="h-4 w-4" />
            <span>{recentUpdates.length} recent</span>
          </button>
        )}

        <button
          onClick={requestDataRefresh}
          className="p-1 text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 rounded transition-colors"
          title="Refresh data"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Recent Updates Dropdown */}
      {showUpdatesList && recentUpdates.length > 0 && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Recent Updates
              </h3>
              <button
                onClick={() => setShowUpdatesList(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {recentUpdates.map((update) => (
              <div
                key={update.id}
                className={`p-3 border-l-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${getUpdateColor(update.type)}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getUpdateIcon(update.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {update.message}
                    </p>
                    
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTimeAgo(update.timestamp)}
                      </span>
                      
                      <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                        {update.type.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Additional Update Details */}
                    {update.type === 'status_updated' && update.data && (
                      <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded">
                            {update.data.oldStatus}
                          </span>
                          <span>→</span>
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
                            {update.data.newStatus}
                          </span>
                        </div>
                        {update.data.updatedByName && (
                          <p className="mt-1">Updated by: {update.data.updatedByName}</p>
                        )}
                      </div>
                    )}

                    {update.type === 'assigned' && update.data && (
                      <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                        <p>Partner: {update.data.partnerName}</p>
                        {update.data.dispatchTime && (
                          <p>Dispatch: {new Date(update.data.dispatchTime).toLocaleTimeString()}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <button
              onClick={() => setRecentUpdates([])}
              className="w-full text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Clear all updates
            </button>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {showToasts && recentUpdates.slice(0, 3).map((update) => (
        <div
          key={`toast_${update.id}`}
          className="fixed top-20 right-4 z-50 animate-in slide-in-from-right duration-300"
          style={{ 
            top: `${80 + (recentUpdates.findIndex(u => u.id === update.id) * 70)}px`,
            animationDelay: `${recentUpdates.findIndex(u => u.id === update.id) * 100}ms`
          }}
        >
          <div className={`p-4 rounded-lg shadow-lg border-l-4 max-w-sm ${getUpdateColor(update.type)} border border-gray-200 dark:border-gray-700`}>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {getUpdateIcon(update.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Real-time Update
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {update.message}
                </p>
                
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTimeAgo(update.timestamp)}
                  </span>
                  
                  <button
                    onClick={() => setRecentUpdates(prev => prev.filter(u => u.id !== update.id))}
                    className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RealTimeOrderUpdates;