import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle,
  Search,
  Download,
  TrendingUp,
  Package,
  Star,
  Filter,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import DeliveryOrderCard from './DeliveryOrderCard';
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

type DateFilter = 'today' | 'week' | 'month' | 'all';

const DeliveryHistory: React.FC = () => {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [error, setError] = useState<string>('');
  
  const { authState } = useAuth();

  useEffect(() => {
    loadOrderHistory();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, dateFilter]);

  const loadOrderHistory = async () => {
    try {
      setRefreshing(true);
      setError('');
      
      const response = await apiService.get<ApiResponse<{ data: DeliveryOrder[] }>>('/delivery/my-orders');
      
      if (response.success && response.data) {
        // Filter only delivered orders for history
        const deliveredOrders = (response.data.data || []).filter(order => order.status === 'DELIVERED');
        setOrders(deliveredOrders);
      } else {
        setError('Failed to load order history');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load order history');
      console.error('Failed to load order history:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(order => new Date(order.createdAt) >= cutoffDate);
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

    // Sort by most recent first
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredOrders(filtered);
  };

  const calculateStats = () => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => 
      sum + order.items.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0), 0
    );
    
    // Calculate average delivery time (mock calculation)
    const avgDeliveryTime = totalOrders > 0 ? Math.floor(Math.random() * 15) + 25 : 0;
    
    // Calculate this week's orders
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeekOrders = orders.filter(order => new Date(order.createdAt) >= oneWeekAgo);
    
    return {
      totalOrders,
      totalRevenue,
      avgDeliveryTime,
      thisWeekOrders: thisWeekOrders.length,
      rating: 4.8 // Mock rating
    };
  };

  const exportData = () => {
    // Mock export functionality
    const csvContent = [
      'Order ID,Customer,Items,Total,Date',
      ...filteredOrders.map(order => {
        const total = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const itemNames = order.items.map(item => `${item.quantity}x ${item.name}`).join('; ');
        return `${order.orderId},"${order.createdBy.name}","${itemNames}",₹${total.toFixed(2)},"${new Date(order.createdAt).toLocaleDateString()}"`;
      })
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `delivery-history-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading your delivery history..." />;
  }

  const stats = calculateStats();

  const dateFilterOptions: { key: DateFilter; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'all', label: 'All Time' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Delivery History</h1>
              <p className="text-gray-600 dark:text-gray-300">
                View your completed deliveries and performance, {authState.user?.name}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={exportData}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
              <button
                onClick={loadOrderHistory}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
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

        {/* Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalOrders}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Deliveries</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{stats.totalRevenue.toFixed(0)}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total amount from your deliveries</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgDeliveryTime}m</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Delivery Time</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.rating}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Average Rating</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                <Calendar className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.thisWeekOrders}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
              </div>
            </div>
          </div>
        </div>

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
              placeholder="Search completed orders by ID, customer name, or items..."
            />
          </div>

          {/* Date Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {dateFilterOptions.map((option) => {
              const isActive = dateFilter === option.key;
              
              return (
                <button
                  key={option.key}
                  onClick={() => setDateFilter(option.key)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Orders History */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Completed Deliveries
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredOrders.length} {filteredOrders.length === 1 ? 'delivery' : 'deliveries'}
            </span>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchQuery || dateFilter !== 'all' ? 'No deliveries found' : 'No completed deliveries yet'}
              </h4>
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery || dateFilter !== 'all' 
                  ? 'Try adjusting your search criteria or date filter' 
                  : 'Your completed deliveries will appear here'
                }
              </p>
              {(searchQuery || dateFilter !== 'all') && (
                <div className="mt-4 space-x-2">
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                    >
                      Clear search
                    </button>
                  )}
                  {dateFilter !== 'all' && (
                    <button
                      onClick={() => setDateFilter('all')}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                    >
                      Show all dates
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{order.orderId}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Delivered on {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">
                        ₹{order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Customer:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">{order.createdBy.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Prep Time:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">{order.prepTime} minutes</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Items:</span>
                      <span className="ml-2">
                        {order.items.map((item, index) => (
                          <span key={index}>
                            {item.quantity}x {item.name}
                            {index < order.items.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryHistory;