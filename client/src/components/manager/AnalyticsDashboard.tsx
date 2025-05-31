import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Package, 
  Users, 
  Activity,
  RefreshCw,
  Download,
  Target,
  AlertCircle,
  DollarSign,
  ShoppingBag,
  Star,
  Truck,
  Award
} from 'lucide-react';
import apiService from '../../services/api';
import { ApiResponse, AnalyticsData } from '../../types';

const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h');

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.get<ApiResponse<AnalyticsData>>(`/analytics/system?timeRange=${timeRange}`);
      setAnalytics(response.data || null);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    loadAnalytics();
    
    // Set up real-time updates
    const interval = setInterval(loadAnalytics, 30000);
    return () => clearInterval(interval);
  }, [loadAnalytics]);

  const calculateOrderEfficiency = () => {
    if (!analytics) return 0;
    const delivered = analytics.orderMetrics.ordersByStatus.DELIVERED || 0;
    const total = analytics.orderMetrics.totalOrders || 1;
    return Math.round((delivered / total) * 100);
  };

  const calculatePartnerUtilization = () => {
    if (!analytics) return 0;
    const busy = analytics.deliveryMetrics.busyPartners || 0;
    const total = analytics.deliveryMetrics.totalPartners || 1;
    return Math.round((busy / total) * 100);
  };

  const getEfficiencyColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBreakdown = () => {
    if (!analytics) return [];
    const statuses = analytics.orderMetrics.ordersByStatus;
    const total = analytics.orderMetrics.totalOrders || 1;
    
    return [
      { status: 'PREP', label: 'In Preparation', count: statuses.PREP || 0, color: 'bg-yellow-500', percentage: ((statuses.PREP || 0) / total) * 100 },
      { status: 'PICKED', label: 'Picked Up', count: statuses.PICKED || 0, color: 'bg-blue-500', percentage: ((statuses.PICKED || 0) / total) * 100 },
      { status: 'ON_ROUTE', label: 'On Route', count: statuses.ON_ROUTE || 0, color: 'bg-purple-500', percentage: ((statuses.ON_ROUTE || 0) / total) * 100 },
      { status: 'DELIVERED', label: 'Delivered', count: statuses.DELIVERED || 0, color: 'bg-green-500', percentage: ((statuses.DELIVERED || 0) / total) * 100 }
    ];
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">Loading analytics...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load analytics</h3>
        <p className="text-gray-500">Please try refreshing the page</p>
      </div>
    );
  }

  const efficiency = calculateOrderEfficiency();
  const utilization = calculatePartnerUtilization();
  const statusBreakdown = getStatusBreakdown();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Analytics Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor business performance and key metrics</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
            
            <button
              onClick={loadAnalytics}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Order Efficiency</p>
              <p className={`text-2xl font-bold ${getEfficiencyColor(efficiency)}`}>{efficiency}%</p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">Delivered vs Total</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
              <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.orderMetrics.totalOrders}</p>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">+8% from last period</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
              <ShoppingBag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Delivery Time</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.orderMetrics.averageDeliveryTime}m</p>
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">-3m from last period</p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-xl">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Partner Utilization</p>
              <p className={`text-2xl font-bold ${getEfficiencyColor(utilization)}`}>{utilization}%</p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">Active Partners</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl">
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Order Status Distribution</h3>
            <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="space-y-4">
            {statusBreakdown.map((item) => (
              <div key={item.status}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{item.count} ({item.percentage.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${item.color} transition-all duration-300`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Partner Workload */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Partner Workload</h3>
            <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="space-y-3">
            {analytics.deliveryMetrics.partnerWorkload.slice(0, 6).map((partner) => (
              <div key={partner.partnerId} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      {partner.partnerName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{partner.partnerName}</p>
                    <p className={`text-xs ${partner.isAvailable ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      {partner.isAvailable ? 'Available' : 'Offline'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-medium ${
                    partner.currentOrders === 0 ? 'text-green-600 dark:text-green-400' :
                    partner.currentOrders <= 2 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {partner.currentOrders}/3
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">orders</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Status */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Real-time Status</h3>
            <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.realTimeData.connectedUsers}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Connected Users</p>
            </div>
          </div>
        </div>
        
        {/* Active Orders */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Orders</h3>
            <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-2">
                <Package className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.realTimeData.activeOrders}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Orders</p>
            </div>
          </div>
        </div>
        
        {/* Pending Assignments */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pending Assignments</h3>
            <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-2">
                <AlertCircle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.realTimeData.pendingAssignments}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Assignments</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;