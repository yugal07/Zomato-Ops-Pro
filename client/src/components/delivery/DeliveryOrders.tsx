import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Clock, 
  RefreshCw,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  Truck,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import DeliveryOrderCard from './DeliveryOrderCard';
import OrderStatusUpdate from './OrderStatusUpdate';
import LoadingSpinner from '../common/LoadingSpinner';
import { ApiResponse } from '../../types';

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

type FilterType = 'all' | 'PREP' | 'PICKED' | 'ON_ROUTE' | 'DELIVERED';

const DeliveryOrders: React.FC = () => {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [error, setError] = useState<string>('');
  
  const { authState } = useAuth();

  useEffect(() => {
    loadOrders();
    
    // Set up real-time updates
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, activeFilter]);

  const loadOrders = async () => {
    try {
      setRefreshing(true);
      setError('');
      
      const response = await apiService.get<ApiResponse<{ data: DeliveryOrder[] }>>('/delivery/my-orders');
      
      if (response.success && response.data) {
        setOrders(response.data.data || []);
      } else {
        setError('Failed to load orders');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Apply status filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(order => order.status === activeFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.orderId.toLowerCase().includes(query) ||
        order.createdBy.name.toLowerCase().includes(query) ||
        order.items.some(item => item.name.toLowerCase().includes(query))
      );
    }

    setFilteredOrders(filtered);
  };

  const handleStatusUpdate = (order: DeliveryOrder) => {
    setSelectedOrder(order);
    setShowStatusUpdate(true);
  };

  const handleStatusUpdateSuccess = () => {
    setShowStatusUpdate(false);
    setSelectedOrder(null);
    loadOrders();
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      PREP: { label: 'In Preparation', color: 'text-yellow-600', count: 0 },
      PICKED: { label: 'Picked Up', color: 'text-blue-600', count: 0 },
      ON_ROUTE: { label: 'On Route', color: 'text-purple-600', count: 0 },
      DELIVERED: { label: 'Delivered', color: 'text-green-600', count: 0 }
    };
    
    // Calculate counts
    orders.forEach(order => {
      if (configs[order.status as keyof typeof configs]) {
        configs[order.status as keyof typeof configs].count++;
      }
    });
    
    return configs[status as keyof typeof configs] || configs.PREP;
  };

  const filterOptions: { key: FilterType; label: string; icon: any }[] = [
    { key: 'all', label: 'All Orders', icon: Package },
    { key: 'PREP', label: 'In Preparation', icon: Clock },
    { key: 'PICKED', label: 'Picked Up', icon: CheckCircle },
    { key: 'ON_ROUTE', label: 'On Route', icon: Truck },
    { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle }
  ];

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading your orders..." />;
  }

  const currentOrders = orders.filter(order => order.status !== 'DELIVERED');
  const completedOrders = orders.filter(order => order.status === 'DELIVERED');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Orders</h1>
              <p className="text-gray-600 dark:text-gray-300">
                Manage your delivery assignments, {authState.user?.name}
              </p>
            </div>
            <button
              onClick={loadOrders}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <span className="text-red-600 dark:text-red-400 font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search orders by ID, customer name, or items..."
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => {
              const statusConfig = getStatusConfig(option.key);
              const Icon = option.icon;
              const isActive = activeFilter === option.key;
              
              return (
                <button
                  key={option.key}
                  onClick={() => setActiveFilter(option.key)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{option.label}</span>
                  {option.key !== 'all' && (
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {statusConfig.count}
                    </span>
                  )}
                  {option.key === 'all' && (
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {orders.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Orders Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentOrders.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Orders</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedOrders.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed Orders</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <Truck className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{orders.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {activeFilter === 'all' ? 'All Orders' : filterOptions.find(f => f.key === activeFilter)?.label}
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
            </span>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchQuery ? 'No orders found' : 'No orders yet'}
              </h4>
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery 
                  ? 'Try adjusting your search criteria' 
                  : 'Your assigned orders will appear here'
                }
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredOrders.map((order) => (
                <DeliveryOrderCard
                  key={order._id}
                  order={order}
                  onStatusUpdate={handleStatusUpdate}
                  showHistory={order.status === 'DELIVERED'}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusUpdate && selectedOrder && (
        <OrderStatusUpdate
          order={selectedOrder}
          onClose={() => {
            setShowStatusUpdate(false);
            setSelectedOrder(null);
          }}
          onSuccess={handleStatusUpdateSuccess}
        />
      )}
    </div>
  );
};

export default DeliveryOrders;