import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Users, 
  Clock, 
  TrendingUp,
  Plus,
  RefreshCw,
  BarChart3,
  Activity,
  Wand2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import CreateOrderForm from './CreateOrderForm';
import OrderTable from './OrderTable';
import PartnerAssignment from './PartnerAssignment';
import AnalyticsDashboard from './AnalyticsDashboard';
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'partners' | 'analytics' | 'mock-generator'>('dashboard');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
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
          <span className="text-gray-600">Loading dashboard...</span>
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

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Overview', icon: Activity },
              { id: 'orders', label: 'Orders', icon: Package },
              { id: 'partners', label: 'Partners', icon: Users },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'mock-generator', label: 'Mock Generator', icon: Wand2 }
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
                  {tab.id === 'mock-generator' && (
                    <span className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs px-2 py-0.5 rounded-full">
                      DEV
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
        )}

        {activeTab === 'orders' && (
          <OrderTable onRefresh={loadDashboardData} />
        )}

        {activeTab === 'partners' && (
          <PartnerAssignment />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard />
        )}

        {activeTab === 'mock-generator' && (
          <div className="space-y-6">
            {/* Development Warning */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Wand2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <div>
                  <h4 className="font-medium text-amber-900 dark:text-amber-200">Development Tool</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    This mock order generator is for testing and development purposes. 
                    Generated orders will appear in your real order system.
                  </p>
                </div>
              </div>
            </div>
            
            <MockOrderGenerator onOrderCreated={handleMockOrderCreated} />
          </div>
        )}
      </div>

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