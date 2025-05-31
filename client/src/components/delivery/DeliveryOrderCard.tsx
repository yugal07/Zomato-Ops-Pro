import React from 'react';
import { 
  Package, 
  Clock, 
  User, 
  MapPin,
  ChevronRight,
  CheckCircle,
  ArrowRight,
  Calendar
} from 'lucide-react';

interface DeliveryOrder {
  _id: string;
  orderId: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  prepTime: number;
  status: 'PREP' | 'PICKED' | 'ON_ROUTE' | 'DELIVERED';
  dispatchTime?: string;
  estimatedDeliveryTime?: string;
  createdBy: {
    name: string;
    email: string;
  };
  createdAt: string;
}

interface DeliveryOrderCardProps {
  order: DeliveryOrder;
  onStatusUpdate: (order: DeliveryOrder) => void;
  compact?: boolean;
  showHistory?: boolean;
}

const DeliveryOrderCard: React.FC<DeliveryOrderCardProps> = ({ 
  order, 
  onStatusUpdate, 
  compact = false,
  showHistory = false 
}) => {
  const getStatusConfig = (status: string) => {
    const configs = {
      PREP: {
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        dot: 'bg-yellow-500',
        label: 'In Preparation',
        description: 'Order is being prepared',
        canUpdate: false
      },
      PICKED: {
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        dot: 'bg-blue-500',
        label: 'Picked Up',
        description: 'Ready for delivery',
        canUpdate: true
      },
      ON_ROUTE: {
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        dot: 'bg-purple-500',
        label: 'On Route',
        description: 'En route to customer',
        canUpdate: true
      },
      DELIVERED: {
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        dot: 'bg-green-500',
        label: 'Delivered',
        description: 'Successfully delivered',
        canUpdate: false
      }
    };
    return configs[status as keyof typeof configs] || configs.PREP;
  };

  const getNextStatus = (currentStatus: string) => {
    const statusFlow = {
      PREP: 'PICKED',
      PICKED: 'ON_ROUTE',
      ON_ROUTE: 'DELIVERED',
      DELIVERED: null
    };
    return statusFlow[currentStatus as keyof typeof statusFlow];
  };

  const getNextStatusLabel = (currentStatus: string) => {
    const labels = {
      PREP: 'Pick Up',
      PICKED: 'Start Delivery',
      ON_ROUTE: 'Mark Delivered',
      DELIVERED: null
    };
    return labels[currentStatus as keyof typeof labels];
  };

  const statusConfig = getStatusConfig(order.status);
  const nextStatus = getNextStatus(order.status);
  const nextStatusLabel = getNextStatusLabel(order.status);
  const totalAmount = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  const formatTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid time';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (compact) {
    return (
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
           onClick={() => onStatusUpdate(order)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">{order.orderId}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">{totalItems} items</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
            <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${
      !showHistory ? 'hover:shadow-md transition-shadow' : ''
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
            <Package className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{order.orderId}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {showHistory ? formatDate(order.createdAt) : `Created ${formatTime(order.createdAt)}`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${statusConfig.dot}`}></div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Order Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Items:</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{totalItems} items</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Total Amount:</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">₹{totalAmount.toFixed(2)}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Prep Time:</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{order.prepTime}m</span>
        </div>

        {order.dispatchTime && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Dispatch Time:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{formatTime(order.dispatchTime)}</span>
          </div>
        )}

        {order.estimatedDeliveryTime && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Est. Delivery:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{formatTime(order.estimatedDeliveryTime)}</span>
          </div>
        )}
      </div>

      {/* Items List */}
      <div className="border-t dark:border-gray-700 pt-3 mb-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Order Items:</h4>
        <div className="space-y-1">
          {order.items.slice(0, 3).map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {item.quantity}x {item.name}
              </span>
              <span className="text-gray-900 dark:text-white">₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          {order.items.length > 3 && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              +{order.items.length - 3} more items
            </p>
          )}
        </div>
      </div>

      {/* Customer Info */}
      <div className="border-t dark:border-gray-700 pt-3 mb-4">
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-gray-400 dark:text-gray-600" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Ordered by:</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{order.createdBy.name}</span>
        </div>
      </div>

      {/* Action Buttons */}
      {!showHistory && statusConfig.canUpdate && nextStatus && (
        <div className="border-t dark:border-gray-700 pt-4">
          <button
            onClick={() => onStatusUpdate(order)}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
            <span>{nextStatusLabel}</span>
          </button>
        </div>
      )}

      {showHistory && (
        <div className="border-t dark:border-gray-700 pt-4">
          <div className="flex items-center justify-center space-x-2 text-green-600 dark:text-green-400">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Delivered Successfully</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryOrderCard;