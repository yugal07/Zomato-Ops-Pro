import React from 'react';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Award,
  CheckCircle,
  Calendar,
  Star,
  BarChart3
} from 'lucide-react';

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

interface PerformanceMetricsProps {
  metrics: DeliveryMetrics | null;
  orderHistory: DeliveryOrder[];
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ metrics, orderHistory }) => {
  // Calculate additional metrics from order history
  const calculateWeeklyStats = () => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weeklyOrders = orderHistory.filter(order => 
      new Date(order.createdAt) >= oneWeekAgo
    );
    
    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayOrders = weeklyOrders.filter(order => 
        new Date(order.createdAt).toDateString() === date.toDateString()
      );
      
      dailyStats.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: date.toDateString(),
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum, order) => 
          sum + order.items.reduce((itemSum, item) => 
            itemSum + (item.price * item.quantity), 0), 0)
      });
    }
    
    return dailyStats;
  };

  const calculateMonthlyComparison = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const currentYear = now.getFullYear();
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    const currentMonthOrders = orderHistory.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    });
    
    const lastMonthOrders = orderHistory.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastMonthYear;
    });
    
    return {
      current: currentMonthOrders.length,
      previous: lastMonthOrders.length,
      change: currentMonthOrders.length - lastMonthOrders.length
    };
  };

  const getPerformanceRating = () => {
    if (!metrics) return 'N/A';
    
    if (metrics.averageDeliveryTime <= 20) return 'Excellent';
    if (metrics.averageDeliveryTime <= 30) return 'Good';
    if (metrics.averageDeliveryTime <= 40) return 'Average';
    return 'Needs Improvement';
  };

  const getPerformanceColor = () => {
    if (!metrics) return 'text-gray-600';
    
    if (metrics.averageDeliveryTime <= 20) return 'text-green-600';
    if (metrics.averageDeliveryTime <= 30) return 'text-blue-600';
    if (metrics.averageDeliveryTime <= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const weeklyStats = calculateWeeklyStats();
  const monthlyComparison = calculateMonthlyComparison();
  const totalRevenue = orderHistory.reduce((sum, order) => 
    sum + order.items.reduce((itemSum, item) => 
      itemSum + (item.price * item.quantity), 0), 0);

  const MetricCard = ({ icon: Icon, title, value, subtitle, color, trend }: {
    icon: any;
    title: string;
    value: string | number;
    subtitle?: string;
    color: string;
    trend?: { value: number; label: string };
  }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-sm ${
            trend.value >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            <TrendingUp className={`h-4 w-4 ${trend.value < 0 ? 'rotate-180' : ''}`} />
            <span>{Math.abs(trend.value)}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{subtitle}</p>
        )}
        {trend && (
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{trend.label}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={CheckCircle}
          title="Total Deliveries"
          value={metrics?.totalDeliveries || 0}
          color="bg-green-500"
          trend={{
            value: monthlyComparison.change,
            label: `vs last month (${monthlyComparison.previous})`
          }}
        />
        
        <MetricCard
          icon={Clock}
          title="Average Delivery Time"
          value={`${metrics?.averageDeliveryTime || 0}m`}
          subtitle={getPerformanceRating()}
          color="bg-blue-500"
        />
        
        <MetricCard
          icon={Star}
          title="Customer Rating"
          value={metrics?.currentRating.toFixed(1) || 'N/A'}
          subtitle="Based on customer feedback"
          color="bg-yellow-500"
        />
        
        <MetricCard
          icon={Target}
          title="Completed Today"
          value={metrics?.completedToday || 0}
          subtitle="Today's deliveries"
          color="bg-purple-500"
        />
      </div>

      {/* Weekly Performance Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Weekly Performance</h3>
          <BarChart3 className="h-5 w-5 text-gray-400 dark:text-gray-600" />
        </div>
        
        <div className="space-y-4">
          {weeklyStats.map((day, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-8">
                  {day.date}
                </span>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((day.orders / Math.max(...weeklyStats.map(d => d.orders), 1)) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {day.orders} orders
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  ₹{day.revenue.toFixed(0)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Delivery Rating:</span>
              <span className={`font-medium ${getPerformanceColor()}`}>
                {getPerformanceRating()}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Revenue:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                ₹{totalRevenue.toFixed(2)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">This Month:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {monthlyComparison.current} deliveries
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Monthly Change:</span>
              <span className={`font-medium ${
                monthlyComparison.change >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {monthlyComparison.change >= 0 ? '+' : ''}{monthlyComparison.change}
              </span>
            </div>
          </div>
        </div>

        {/* Achievement Badges */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Achievements</h3>
          <div className="space-y-3">
            <div className={`flex items-center space-x-3 p-3 rounded-lg ${
              (metrics?.totalDeliveries || 0) >= 10 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
            }`}>
              <Award className={`h-5 w-5 ${
                (metrics?.totalDeliveries || 0) >= 10 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-gray-400 dark:text-gray-600'
              }`} />
              <div>
                <p className={`font-medium ${
                  (metrics?.totalDeliveries || 0) >= 10 
                    ? 'text-green-900 dark:text-green-100' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  First 10 Deliveries
                </p>
                <p className={`text-sm ${
                  (metrics?.totalDeliveries || 0) >= 10 
                    ? 'text-green-700 dark:text-green-300' 
                    : 'text-gray-500 dark:text-gray-500'
                }`}>
                  {(metrics?.totalDeliveries || 0) >= 10 ? 'Completed!' : `${metrics?.totalDeliveries || 0}/10`}
                </p>
              </div>
            </div>

            <div className={`flex items-center space-x-3 p-3 rounded-lg ${
              (metrics?.averageDeliveryTime || 0) <= 25 
                ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
                : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
            }`}>
              <Clock className={`h-5 w-5 ${
                (metrics?.averageDeliveryTime || 0) <= 25 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-400 dark:text-gray-600'
              }`} />
              <div>
                <p className={`font-medium ${
                  (metrics?.averageDeliveryTime || 0) <= 25 
                    ? 'text-blue-900 dark:text-blue-100' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  Speed Demon
                </p>
                <p className={`text-sm ${
                  (metrics?.averageDeliveryTime || 0) <= 25 
                    ? 'text-blue-700 dark:text-blue-300' 
                    : 'text-gray-500 dark:text-gray-500'
                }`}>
                  {(metrics?.averageDeliveryTime || 0) <= 25 ? 'Under 25min average!' : 'Achieve <25min average'}
                </p>
              </div>
            </div>

            <div className={`flex items-center space-x-3 p-3 rounded-lg ${
              (metrics?.currentRating || 0) >= 4.5 
                ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' 
                : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
            }`}>
              <Star className={`h-5 w-5 ${
                (metrics?.currentRating || 0) >= 4.5 
                  ? 'text-yellow-600 dark:text-yellow-400' 
                  : 'text-gray-400 dark:text-gray-600'
              }`} />
              <div>
                <p className={`font-medium ${
                  (metrics?.currentRating || 0) >= 4.5 
                    ? 'text-yellow-900 dark:text-yellow-100' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  Customer Favorite
                </p>
                <p className={`text-sm ${
                  (metrics?.currentRating || 0) >= 4.5 
                    ? 'text-yellow-700 dark:text-yellow-300' 
                    : 'text-gray-500 dark:text-gray-500'
                }`}>
                  {(metrics?.currentRating || 0) >= 4.5 ? '4.5+ star rating!' : 'Maintain 4.5+ stars'}
                </p>
              </div>
            </div>

            <div className={`flex items-center space-x-3 p-3 rounded-lg ${
              monthlyComparison.current >= 50 
                ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800' 
                : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
            }`}>
              <Calendar className={`h-5 w-5 ${
                monthlyComparison.current >= 50 
                  ? 'text-purple-600 dark:text-purple-400' 
                  : 'text-gray-400 dark:text-gray-600'
              }`} />
              <div>
                <p className={`font-medium ${
                  monthlyComparison.current >= 50 
                    ? 'text-purple-900 dark:text-purple-100' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  Monthly Champion
                </p>
                <p className={`text-sm ${
                  monthlyComparison.current >= 50 
                    ? 'text-purple-700 dark:text-purple-300' 
                    : 'text-gray-500 dark:text-gray-500'
                }`}>
                  {monthlyComparison.current >= 50 ? '50+ deliveries this month!' : `${monthlyComparison.current}/50 this month`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tips for Improvement */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">🚀 Speed Up Deliveries</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Plan your routes efficiently and communicate with customers about delivery times to improve your average delivery speed.
            </p>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">⭐ Boost Ratings</h4>
            <p className="text-sm text-green-700 dark:text-green-300">
              Ensure orders are handled carefully, arrive on time, and maintain professional communication for higher customer satisfaction.
            </p>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">📈 Increase Volume</h4>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Stay available during peak hours and maintain good performance metrics to receive more order assignments.
            </p>
          </div>
          
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
            <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-2">💡 Pro Tips</h4>
            <p className="text-sm text-orange-700 dark:text-orange-300">
              Update your status promptly, keep the app running for real-time notifications, and follow delivery best practices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;