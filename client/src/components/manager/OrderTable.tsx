import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  User, 
  Clock, 
  Package, 
  Truck,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  UserPlus
} from 'lucide-react';
import apiService from '../../services/api';
import PartnerAssignmentModal from './PartnerAssignmentModal';
import OrderDetailsModal from './OrderDetailsModal';
import { ApiResponse, OrdersResponse } from '../../types';

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

interface OrderTableProps {
  onRefresh: () => void;
}

const OrderTable: React.FC<OrderTableProps> = ({ onRefresh }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await apiService.get<ApiResponse<OrdersResponse>>(`/orders?${params}`);
      setOrders(response.data?.data || []);
      setTotalPages(response.data?.totalPages || 1);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = orders.filter(order => {
    if (!order || !order.orderId) return false;
    
    // If no search query, return all orders
    if (!searchQuery || searchQuery.trim() === '') return true;
    
    const searchTerm = searchQuery.toLowerCase().trim();
    const orderIdMatch = order.orderId.toLowerCase().includes(searchTerm);
    const itemsMatch = order.items && Array.isArray(order.items) && order.items.some(item => 
      item && item.name && typeof item.name === 'string' && 
      item.name.toLowerCase().includes(searchTerm)
    );
    
    return orderIdMatch || itemsMatch;
  });

  const getStatusConfig = (status: string) => {
    const configs = {
      PREP: {
        color: 'bg-yellow-100 text-yellow-800',
        icon: Clock,
        label: 'In Preparation'
      },
      PICKED: {
        color: 'bg-blue-100 text-blue-800',
        icon: Package,
        label: 'Picked Up'
      },
      ON_ROUTE: {
        color: 'bg-purple-100 text-purple-800',
        icon: Truck,
        label: 'On Route'
      },
      DELIVERED: {
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
        label: 'Delivered'
      }
    };
    return configs[status as keyof typeof configs] || configs.PREP;
  };

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

  const handleAssignPartner = (order: Order) => {
    setSelectedOrder(order);
    setShowAssignModal(true);
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleAssignmentSuccess = () => {
    setShowAssignModal(false);
    setSelectedOrder(null);
    loadOrders();
    onRefresh();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">Loading orders...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Order Management</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Track and manage all restaurant orders</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PREPARING">Preparing</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            
            <button
              onClick={onRefresh}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No orders found</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery ? 'Try adjusting your search terms' : 'Create your first order to get started'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-600 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Order Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Items & Total
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Assigned Partner
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Timing
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                  {filteredOrders.map((order) => {
                    if (!order || !order._id) return null;
                    
                    const statusConfig = getStatusConfig(order.status || 'PREP');
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                        {/* Order Details */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {order.orderId}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(order.createdAt)}
                          </div>
                        </td>

                        {/* Items & Prep Time */}
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {order.items?.map((item, index) => (
                              <div key={index} className="flex justify-between">
                                <span>{item.name} x{item.quantity}</span>
                                <span>₹{item.price}</span>
                              </div>
                            ))}
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                            Total: ₹{order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig.label}
                          </div>
                        </td>

                        {/* Assigned Partner */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {order.assignedPartner ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                <User className="h-3 w-3 text-green-600 dark:text-green-400" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {order.assignedPartner.name || 'Unknown'}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {order.assignedPartner.email || 'No email'}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <AlertCircle className="h-4 w-4 text-orange-500 dark:text-orange-400" />
                              <span className="text-sm text-gray-500 dark:text-gray-400">Unassigned</span>
                            </div>
                          )}
                        </td>

                        {/* Timing */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {order.dispatchTime && (
                            <div>
                              <div>Dispatch: {formatTime(order.dispatchTime)}</div>
                              {order.estimatedDeliveryTime && (
                                <div className="text-xs">
                                  ETA: {formatTime(order.estimatedDeliveryTime)}
                                </div>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleViewDetails(order)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500 p-1 hover:bg-blue-50 dark:hover:bg-gray-700 rounded transition-colors"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            
                            {!order.assignedPartner && order.status === 'PREP' && (
                              <button
                                onClick={() => handleAssignPartner(order)}
                                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-500 p-1 hover:bg-green-50 dark:hover:bg-gray-700 rounded transition-colors"
                                title="Assign Partner"
                              >
                                <UserPlus className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 dark:bg-gray-600 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAssignModal && selectedOrder && (
        <PartnerAssignmentModal
          order={selectedOrder}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedOrder(null);
          }}
          onSuccess={handleAssignmentSuccess}
        />
      )}

      {showDetailsModal && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
};

export default OrderTable;