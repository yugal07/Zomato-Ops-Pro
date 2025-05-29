import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Package, 
  Users, 
  Activity,
  RefreshCw,
  Download,
  Calendar,
  Target,
  AlertCircle,
  CheckCircle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import apiService from '../../services/api';
import { ApiResponse, AnalyticsData } from '../../types';

const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h');

  useEffect(() => {
    loadAnalytics();
    
    // Set up real-time updates
    const interval = setInterval(loadAnalytics, 30000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await apiService.get<ApiResponse<AnalyticsData>>(`/analytics/system?timeRange=${timeRange}`);
      setAnalytics(response.data || null);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Analytics Dashboard</h2>
            <p className="text-gray-600">Comprehensive insights into your delivery operations</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>

            <button
              onClick={loadAnalytics}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Order Efficiency</p>
              <p className={`text-2xl font-bold ${getEfficiencyColor(efficiency)}`}>{efficiency}%</p>
              <p className="text-xs text-gray-500">Delivered vs Total</p>
            </div>
            <Target className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Partner Utilization</p>
              <p className={`text-2xl font-bold ${getEfficiencyColor(utilization)}`}>{utilization}%</p>
              <p className="text-xs text-gray-500">Active Partners</p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Prep Time</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.orderMetrics.averagePrepTime}m</p>
              <p className="text-xs text-gray-500">Kitchen efficiency</p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Delivery</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.orderMetrics.averageDeliveryTime}m</p>
              <p className="text-xs text-gray-500">Partner performance</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Real-time Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Activity className="h-5 w-5 text-blue-600 mr-2" />
          Real-time Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{analytics.realTimeData.connectedUsers}</p>
            <p className="text-sm text-gray-600">Connected Users</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Package className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{analytics.realTimeData.activeOrders}</p>
            <p className="text-sm text-gray-600">Active Orders</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{analytics.realTimeData.pendingAssignments}</p>
            <p className="text-sm text-gray-600">Pending Assignments</p>
          </div>
        </div>
      </div>

      {/* Order Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
            Order Status Distribution
          </h3>
          <div className="space-y-4">
            {statusBreakdown.map((item) => (
              <div key={item.status}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  <span className="text-sm text-gray-500">{item.count} ({item.percentage.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="h-5 w-5 text-green-600 mr-2" />
            Partner Workload
          </h3>
          <div className="space-y-3">
            {analytics.deliveryMetrics.partnerWorkload.slice(0, 6).map((partner) => (
              <div key={partner.partnerId} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      {partner.partnerName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{partner.partnerName}</p>
                    <p className={`text-xs ${partner.isAvailable ? 'text-green-600' : 'text-gray-500'}`}>
                      {partner.isAvailable ? 'Available' : 'Offline'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-medium ${
                    partner.currentOrders === 0 ? 'text-green-600' :
                    partner.currentOrders <= 2 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {partner.currentOrders}/3
                  </span>
                  <p className="text-xs text-gray-500">orders</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
          Performance Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-800">Excellent</span>
            </div>
            <p className="text-xs text-green-600">
              {efficiency >= 80 ? 'Order completion rate is excellent' : 
               utilization >= 80 ? 'Partner utilization is optimal' :
               'System performance is stable'}
            </p>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm font-medium text-yellow-800">Monitor</span>
            </div>
            <p className="text-xs text-yellow-600">
              {analytics.realTimeData.pendingAssignments > 0 
                ? `${analytics.realTimeData.pendingAssignments} orders awaiting partner assignment`
                : 'Average prep time could be optimized'}
            </p>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-800">Opportunity</span>
            </div>
            <p className="text-xs text-blue-600">
              {analytics.deliveryMetrics.availablePartners > 0
                ? `${analytics.deliveryMetrics.availablePartners} partners available for new orders`
                : 'Consider onboarding more delivery partners'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;