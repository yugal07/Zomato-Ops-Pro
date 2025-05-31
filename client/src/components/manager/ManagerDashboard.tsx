import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Users, 
  Clock, 
  TrendingUp,
  Plus,
  RefreshCw,
  Wand2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import CreateOrderForm from './CreateOrderForm';
import MockOrderGenerator from './MockOrderGenerator';
import { ApiResponse, OrderMetrics, DeliveryMetrics } from '../../types';

interface DashboardMetrics {
  totalOrders: number;
  ordersByStatus: Record<string, number>;
  totalPartners: number;
  availablePartners: number;
  averagePrepTime: number;
  averageDeliveryTime: number;
  recentOrders: any[];
}

const ManagerDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [showMockGenerator, setShowMockGenerator] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { authState } = useAuth();

  useEffect(() => {
    loadDashboardData();
    
    // Set up real-time updates
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setRefreshing(true);
      const [orderMetrics, deliveryMetrics] = await Promise.all([
        apiService.get<ApiResponse<OrderMetrics>>('/analytics/orders'),
        apiService.get<ApiResponse<DeliveryMetrics>>('/analytics/delivery')
      ]);

      setMetrics({
        totalOrders: orderMetrics.data?.totalOrders || 0,
        ordersByStatus: orderMetrics.data?.ordersByStatus || {},
        totalPartners: deliveryMetrics.data?.totalPartners || 0,
        availablePartners: deliveryMetrics.data?.availablePartners || 0,
        averagePrepTime: orderMetrics.data?.averagePrepTime || 0,
        averageDeliveryTime: orderMetrics.data?.averageDeliveryTime || 0,
        recentOrders: orderMetrics.data?.recentOrders || []
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleOrderCreated = () => {
    setShowCreateOrder(false);
    loadDashboardData();
  };

  const handleMockOrderCreated = () => {
    loadDashboardData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
          <span className="text-gray-600 dark:text-gray-300">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const MetricCard = ({ icon: Icon, title, value, subtitle, color }: {
    icon: any;
    title: string;
    value: string | number;
    subtitle?: string;
    color: string;
  }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{subtitle}</p>
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manager Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300">Welcome back, {authState.user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadDashboardData}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => setShowMockGenerator(true)}
                className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Wand2 className="h-4 w-4" />
                <span>Simulate Order</span>
              </button>
              <button
                onClick={() => setShowCreateOrder(true)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>New Order</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Metrics Grid */}
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                icon={Package}
                title="Total Orders"
                value={metrics.totalOrders}
                subtitle="Last 24 hours"
                color="bg-blue-500"
              />
              <MetricCard
                icon={Users}
                title="Available Partners"
                value={`${metrics.availablePartners}/${metrics.totalPartners}`}
                subtitle="Ready for delivery"
                color="bg-green-500"
              />
              <MetricCard
                icon={Clock}
                title="Avg Prep Time"
                value={`${metrics.averagePrepTime}m`}
                subtitle="Kitchen efficiency"
                color="bg-orange-500"
              />
              <MetricCard
                icon={TrendingUp}
                title="Avg Delivery"
                value={`${metrics.averageDeliveryTime}m`}
                subtitle="Partner performance"
                color="bg-purple-500"
              />
            </div>
          )}

          {/* Order Status Overview */}
          {metrics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Status Overview</h3>
                <div className="space-y-4">
                  {Object.entries(metrics.ordersByStatus).map(([status, count]) => {
                    const statusConfig = {
                      PREP: { color: 'bg-yellow-500', label: 'In Preparation' },
                      PICKED: { color: 'bg-blue-500', label: 'Picked Up' },
                      ON_ROUTE: { color: 'bg-purple-500', label: 'On Route' },
                      DELIVERED: { color: 'bg-green-500', label: 'Delivered' }
                    };
                    const config = statusConfig[status as keyof typeof statusConfig];
                    
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${config?.color || 'bg-gray-400'}`}></div>
                          <span className="text-gray-700 dark:text-gray-300">{config?.label || status}</span>
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Orders</h3>
                <div className="space-y-3">
                  {metrics.recentOrders.slice(0, 5).map((order) => (
                    <div key={order._id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{order.orderId}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{order.items.length} items</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          order.status === 'DELIVERED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          order.status === 'ON_ROUTE' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                          order.status === 'PICKED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mock Order Generator Modal */}
      {showMockGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Wand2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Mock Order Generator</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Generate test orders for development and testing</p>
                </div>
              </div>
              <button
                onClick={() => setShowMockGenerator(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <span className="sr-only">Close</span>
                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <MockOrderGenerator onOrderCreated={handleMockOrderCreated} />
            </div>
          </div>
        </div>
      )}

      {/* Create Order Modal */}
      {showCreateOrder && (
        <CreateOrderForm
          onClose={() => setShowCreateOrder(false)}
          onSuccess={handleOrderCreated}
        />
      )}
    </div>
  );
};

export default ManagerDashboard;