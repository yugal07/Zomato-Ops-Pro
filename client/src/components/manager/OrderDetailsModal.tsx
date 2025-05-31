import React from 'react';
import { 
  X, 
  Package, 
  Clock, 
  User, 
  CheckCircle, 
  Truck,
  Calendar,
  Hash,
  ShoppingBag
} from 'lucide-react';

interface Order {
  _id: string;
  orderId: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  prepTime: number;
  status: 'PREP' | 'PICKED' | 'ON_ROUTE' | 'DELIVERED';
  assignedPartner?: {
    _id: string;
    name: string;
    email: string;
  };
  dispatchTime?: string;
  estimatedDeliveryTime?: string;
  createdBy: {
    name: string;
    email: string;
  };
  createdAt: string;
}

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose }) => {
  const getStatusConfig = (status: string) => {
    const configs = {
      PREP: {
        color: 'bg-yellow-500',
        textColor: 'text-yellow-800',
        bgColor: 'bg-yellow-100',
        label: 'In Preparation',
        description: 'Order is being prepared in the kitchen'
      },
      PICKED: {
        color: 'bg-blue-500',
        textColor: 'text-blue-800',
        bgColor: 'bg-blue-100',
        label: 'Picked Up',
        description: 'Order has been picked up by delivery partner'
      },
      ON_ROUTE: {
        color: 'bg-purple-500',
        textColor: 'text-purple-800',
        bgColor: 'bg-purple-100',
        label: 'On Route',
        description: 'Order is on the way to customer'
      },
      DELIVERED: {
        color: 'bg-green-500',
        textColor: 'text-green-800',
        bgColor: 'bg-green-100',
        label: 'Delivered',
        description: 'Order has been successfully delivered'
      }
    };
    return configs[status as keyof typeof configs] || configs.PREP;
  };

  const statusConfig = getStatusConfig(order.status);
  const totalAmount = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Order status timeline
  const getStatusTimeline = () => {
    const statuses = ['PREP', 'PICKED', 'ON_ROUTE', 'DELIVERED'];
    const currentIndex = statuses.indexOf(order.status);
    
    return statuses.map((status, index) => ({
      status,
      label: getStatusConfig(status).label,
      completed: index <= currentIndex,
      current: index === currentIndex
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
              <p className="text-gray-500">#{order.orderId}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.textColor} ${statusConfig.bgColor}`}>
              {statusConfig.label}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Timeline */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Progress</h3>
            <div className="flex items-center justify-between">
              {getStatusTimeline().map((step, index) => (
                <div key={step.status} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step.completed 
                        ? step.current 
                          ? statusConfig.color 
                          : 'bg-green-500'
                        : 'bg-gray-300'
                    }`}>
                      {step.completed ? (
                        <CheckCircle className="h-5 w-5 text-white" />
                      ) : (
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className={`text-xs mt-2 text-center ${
                      step.completed ? 'text-gray-900 font-medium' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {index < getStatusTimeline().length - 1 && (
                    <div className={`h-1 w-16 mx-4 ${
                      step.completed ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">{statusConfig.description}</p>
            </div>
          </div>

          {/* Order Information */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Package className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              Order Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Order ID</p>
                <p className="font-medium text-gray-900 dark:text-white">{order.orderId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusConfig(order.status).textColor} ${getStatusConfig(order.status).bgColor}`}>
                  {getStatusConfig(order.status).label}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                <p className="font-medium text-gray-900 dark:text-white">₹{totalAmount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Order Time</p>
                <p className="font-medium text-gray-900 dark:text-white">{formatTime(order.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <User className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
              Customer Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                <p className="font-medium text-gray-900 dark:text-white">{order.createdBy.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                <p className="font-medium text-gray-900 dark:text-white">{order.createdBy.email}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <ShoppingBag className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
              Order Items
            </h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">₹{item.price * item.quantity}</p>
                </div>
              ))}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-gray-900 dark:text-white">Total</p>
                  <p className="font-semibold text-gray-900 dark:text-white">₹{totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          {(order.assignedPartner || order.dispatchTime || order.estimatedDeliveryTime) && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Truck className="h-5 w-5 text-gray-600 mr-2" />
                Delivery Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {order.assignedPartner && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Assigned Partner</h4>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{order.assignedPartner.name}</p>
                        <p className="text-sm text-gray-500">{order.assignedPartner.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {order.dispatchTime && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Dispatch Time:
                      </span>
                      <span className="font-medium text-gray-900">{formatTime(order.dispatchTime)}</span>
                    </div>
                  )}
                  {order.estimatedDeliveryTime && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Est. Delivery:
                      </span>
                      <span className="font-medium text-gray-900">{formatTime(order.estimatedDeliveryTime)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Need Help?</h4>
                <p className="text-sm text-gray-600">Contact support for order-related queries</p>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;