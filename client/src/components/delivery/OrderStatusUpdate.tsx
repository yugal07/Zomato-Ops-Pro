import React, { useState } from 'react';
import { 
  X, 
  Package, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  Truck,
  AlertCircle,
  MapPin,
  User
} from 'lucide-react';
import apiService from '../../services/api';

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

interface OrderStatusUpdateProps {
  order: DeliveryOrder;
  onClose: () => void;
  onSuccess: () => void;
}

const OrderStatusUpdate: React.FC<OrderStatusUpdateProps> = ({ order, onClose, onSuccess }) => {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const getStatusFlow = () => {
    const allStatuses = [
      { 
        key: 'PREP', 
        label: 'In Preparation', 
        description: 'Order is being prepared in the kitchen',
        color: 'bg-yellow-500',
        icon: Clock
      },
      { 
        key: 'PICKED', 
        label: 'Picked Up', 
        description: 'Order has been picked up by delivery partner',
        color: 'bg-blue-500',
        icon: Package
      },
      { 
        key: 'ON_ROUTE', 
        label: 'On Route', 
        description: 'Order is on the way to customer',
        color: 'bg-purple-500',
        icon: Truck
      },
      { 
        key: 'DELIVERED', 
        label: 'Delivered', 
        description: 'Order has been successfully delivered',
        color: 'bg-green-500',
        icon: CheckCircle
      }
    ];

    const currentIndex = allStatuses.findIndex(s => s.key === order.status);
    
    return allStatuses.map((status, index) => ({
      ...status,
      isCompleted: index < currentIndex,
      isCurrent: index === currentIndex,
      isNext: index === currentIndex + 1,
      isAvailable: index <= currentIndex + 1 && index > currentIndex
    }));
  };

  const getNextStatus = () => {
    const statusOrder = ['PREP', 'PICKED', 'ON_ROUTE', 'DELIVERED'];
    const currentIndex = statusOrder.indexOf(order.status);
    return currentIndex < statusOrder.length - 1 ? statusOrder[currentIndex + 1] : null;
  };

  const getStatusUpdateMessage = (newStatus: string) => {
    const messages = {
      'PICKED': 'Confirm that you have picked up this order and are ready to start delivery',
      'ON_ROUTE': 'Confirm that you are now en route to the customer with this order',
      'DELIVERED': 'Confirm that this order has been successfully delivered to the customer'
    };
    return messages[newStatus as keyof typeof messages] || '';
  };

  const canUpdateToStatus = (status: string) => {
    const statusOrder = ['PREP', 'PICKED', 'ON_ROUTE', 'DELIVERED'];
    const currentIndex = statusOrder.indexOf(order.status);
    const targetIndex = statusOrder.indexOf(status);
    
    // Can only move to the next status in sequence
    return targetIndex === currentIndex + 1;
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatus) {
      setError('Please select a status to update');
      return;
    }

    try {
      setUpdating(true);
      setError('');

      await apiService.put(`/orders/${order._id}/status`, {
        status: selectedStatus
      });

      onSuccess();
    } catch (error: any) {
      setError(error.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const statusFlow = getStatusFlow();
  const nextStatus = getNextStatus();
  const totalAmount = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
              <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Update Order Status</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Order {order.orderId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {/* Order Summary */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Order Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Items:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Total:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">₹{totalAmount.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Customer:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">{order.createdBy.name}</span>
              </div>
              {order.dispatchTime && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Dispatch:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">{formatTime(order.dispatchTime)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Status Flow */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Progress</h3>
            <div className="space-y-3">
              {statusFlow.map((status, index) => {
                const IconComponent = status.icon;
                const isSelectable = canUpdateToStatus(status.key);
                
                return (
                  <div
                    key={status.key}
                    className={`flex items-center p-3 rounded-lg border-2 transition-all ${
                      status.isCompleted
                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                        : status.isCurrent
                        ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                        : isSelectable
                        ? selectedStatus === status.key
                          ? 'border-blue-500 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/30 cursor-pointer'
                          : 'border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer'
                        : 'border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700 opacity-50'
                    }`}
                    onClick={() => isSelectable && setSelectedStatus(status.key)}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      status.isCompleted || (status.isCurrent && status.key !== order.status)
                        ? status.color
                        : status.isCurrent
                        ? 'bg-blue-500'
                        : selectedStatus === status.key
                        ? status.color
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}>
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    
                    <div className="ml-4 flex-1">
                      <h4 className={`font-medium ${
                        status.isCompleted || status.isCurrent || selectedStatus === status.key
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {status.label}
                      </h4>
                      <p className={`text-sm ${
                        status.isCompleted || status.isCurrent || selectedStatus === status.key
                          ? 'text-gray-600 dark:text-gray-300'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}>
                        {status.description}
                      </p>
                    </div>

                    {status.isCompleted && (
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    )}
                    
                    {status.isCurrent && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    )}
                    
                    {isSelectable && selectedStatus === status.key && (
                      <ArrowRight className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Confirmation Message */}
          {selectedStatus && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-1">Confirm Status Update</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {getStatusUpdateMessage(selectedStatus)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <span className="text-red-600 dark:text-red-400 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Quick Update Section */}
          {nextStatus && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Quick Update</h4>
              <button
                onClick={() => setSelectedStatus(nextStatus)}
                className={`w-full flex items-center justify-center space-x-2 p-3 rounded-lg border-2 transition-all ${
                  selectedStatus === nextStatus
                    ? 'border-blue-500 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/30'
                    : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700'
                }`}
              >
                <ArrowRight className="h-4 w-4" />
                <span>Move to {statusFlow.find(s => s.key === nextStatus)?.label}</span>
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleStatusUpdate}
              disabled={!selectedStatus || updating}
              className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                !selectedStatus || updating
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {updating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Update Status</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderStatusUpdate;