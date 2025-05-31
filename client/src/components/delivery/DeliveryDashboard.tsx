import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Clock, 
  TrendingUp,
  MapPin,
  CheckCircle,
  Truck,
  Activity,
  RefreshCw,
  User,
  Calendar,
  Target
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import OrderStatusUpdate from './OrderStatusUpdate';
import DeliveryOrderCard from './DeliveryOrderCard';
import PerformanceMetrics from './PerformanceMetrics';
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

interface DeliveryMetrics {
  totalDeliveries: number;
  completedToday: number;
  averageDeliveryTime: number;
  currentRating: number;
  currentOrders: number;
  isAvailable: boolean;
}

const DeliveryDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'history' | 'performance'>('dashboard');
  const [currentOrders, setCurrentOrders] = useState<DeliveryOrder[]>([]);
  const [orderHistory, setOrderHistory] = useState<DeliveryOrder[]>([]);
  const [metrics, setMetrics] = useState<DeliveryMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const { authState } = useAuth();

  useEffect(() => {
    loadDashboardData();
    
    // Set up real-time updates
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setRefreshing(true);
      const [ordersResponse, profileResponse] = await Promise.all([
        apiService.get<ApiResponse<{ data: DeliveryOrder[] }>>('/delivery/my-orders'),
        apiService.get<ApiResponse<any>>('/delivery/profile')
      ]);

      const orders = ordersResponse.data?.data || [];
      
      // Separate current orders from history
      const current = orders.filter(order => order.status !== 'DELIVERED');
      const history = orders.filter(order => order.status === 'DELIVERED');
      
      setCurrentOrders(current);
      setOrderHistory(history);

      // Calculate metrics
      const profile = profileResponse.data;
      if (profile) {
        setMetrics({
          totalDeliveries: history.length,
          completedToday: history.filter(order => 
            new Date(order.createdAt).toDateString() === new Date().toDateString()
          ).length,
          averageDeliveryTime: profile.averageDeliveryTime || 30,
          currentRating: 4.8, // This would come from your rating system
          currentOrders: current.length,
          isAvailable: profile.isAvailable
        });
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleStatusUpdate = (order: DeliveryOrder) => {
    setSelectedOrder(order);
    setShowStatusUpdate(true);
  };

  const handleStatusUpdateSuccess = () => {
    setShowStatusUpdate(false);
    setSelectedOrder(null);
    loadDashboardData();
  };

  const toggleAvailability = async () => {
    try {
      await apiService.put('/delivery/availability');
      loadDashboardData();
    } catch (error) {
      console.error('Failed to toggle availability:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
          <span className="text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const MetricCard = ({ icon: Icon, title, value, subtitle, color, action }: {
    icon: any;
    title: string;
    value: string | number;
    subtitle?: string;
    color: string;
    action?: () => void;
  }) => (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow ${action ? 'cursor-pointer' : ''}`}
      onClick={action}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Delivery Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300">Welcome back, {authState.user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Availability Toggle */}
              <button
                onClick={toggleAvailability}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  metrics?.isAvailable
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${metrics?.isAvailable ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                <span>{metrics?.isAvailable ? 'Available' : 'Offline'}</span>
              </button>
              
              <button
                onClick={loadDashboardData}
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

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Overview', icon: Activity },
              { id: 'orders', label: 'Current Orders', icon: Package },
              { id: 'history', label: 'Order History', icon: Calendar },
              { id: 'performance', label: 'Performance', icon: TrendingUp }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {tab.id === 'orders' && currentOrders.length > 0 && (
                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                      {currentOrders.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Metrics Grid */}
            {metrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  icon={Package}
                  title="Current Orders"
                  value={metrics.currentOrders}
                  subtitle="Active deliveries"
                  color="bg-blue-500"
                  action={() => setActiveTab('orders')}
                />
                <MetricCard
                  icon={CheckCircle}
                  title="Completed Today"
                  value={metrics.completedToday}
                  subtitle="Successful deliveries"
                  color="bg-green-500"
                />
                <MetricCard
                  icon={Clock}
                  title="Avg Delivery Time"
                  value={`${metrics.averageDeliveryTime}m`}
                  subtitle="Your performance"
                  color="bg-orange-500"
                />
                <MetricCard
                  icon={Target}
                  title="Rating"
                  value={metrics.currentRating.toFixed(1)}
                  subtitle="Customer feedback"
                  color="bg-purple-500"
                />
              </div>
            )}

            {/* Quick Actions & Current Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Current Orders Quick View */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Current Orders</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    View All
                  </button>
                </div>
                
                {currentOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Active Orders</h4>
                    <p className="text-gray-500 dark:text-gray-400">
                      {metrics?.isAvailable ? 'You\'re available for new orders' : 'Set yourself as available to receive orders'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentOrders.slice(0, 3).map((order) => (
                      <DeliveryOrderCard
                        key={order._id}
                        order={order}
                        onStatusUpdate={handleStatusUpdate}
                        compact
                      />
                    ))}
                    {currentOrders.length > 3 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center pt-2">
                        +{currentOrders.length - 3} more orders
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Today's Summary</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      metrics?.isAvailable 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {metrics?.isAvailable ? 'Available' : 'Offline'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Deliveries:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{metrics?.completedToday || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Orders:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{metrics?.totalDeliveries || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Avg Time:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{metrics?.averageDeliveryTime || 0}m</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Current Orders</h3>
              
              {currentOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Active Orders</h4>
                  <p className="text-gray-500 dark:text-gray-400">
                    {metrics?.isAvailable ? 'You\'re available for new orders' : 'Set yourself as available to receive orders'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {currentOrders.map((order) => (
                    <DeliveryOrderCard
                      key={order._id}
                      order={order}
                      onStatusUpdate={handleStatusUpdate}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order History</h3>
              
              {orderHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Completed Orders</h4>
                  <p className="text-gray-500 dark:text-gray-400">Your completed deliveries will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orderHistory.map((order) => (
                    <DeliveryOrderCard
                      key={order._id}
                      order={order}
                      onStatusUpdate={handleStatusUpdate}
                      showHistory
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <PerformanceMetrics 
            metrics={metrics}
            orderHistory={orderHistory}
          />
        )}
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

export default DeliveryDashboard;