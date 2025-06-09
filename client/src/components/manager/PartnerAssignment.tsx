import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MapPin,
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  User,
  Activity,
  Search,
  Clock,
  UserX
} from 'lucide-react';
import apiService from '../../services/api';
import { ApiResponse } from '../../types';

interface DeliveryPartner {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  isAvailable: boolean;
  currentOrders: Array<{
    _id: string;
    orderId: string;
    status: string;
    items: any[];
  }>;
  location: {
    lat: number;
    lng: number;
  };
  averageDeliveryTime: number;
  createdAt: string;
}

const PartnerAssignment: React.FC = () => {
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'busy'>('all');

  useEffect(() => {
    loadPartners();
    
    // Set up real-time updates
    const interval = setInterval(loadPartners, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadPartners = async () => {
    try {
      setLoading(true);
      const response = await apiService.get<ApiResponse<DeliveryPartner[]>>('/delivery/partners');
      setPartners(response.data || []);
    } catch (error) {
      console.error('Failed to load partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPartners = partners.filter(partner => {
  const matchesSearch = partner.userId.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         partner.userId.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (filterStatus === 'available') return partner.isAvailable && partner.currentOrders.length === 0;
    if (filterStatus === 'busy') return partner.currentOrders.length > 0;
    
    return true;
  });

  const getPartnerStatus = (partner: DeliveryPartner) => {
    if (!partner.isAvailable) {
      return { status: 'Offline', color: 'bg-gray-100 text-gray-800', dotColor: 'bg-gray-400' };
    }
    if (partner.currentOrders.length === 0) {
      return { status: 'Available', color: 'bg-green-100 text-green-800', dotColor: 'bg-green-400' };
    }
    if (partner.currentOrders.length >= 3) {
      return { status: 'At Capacity', color: 'bg-red-100 text-red-800', dotColor: 'bg-red-400' };
    }
    return { status: 'Busy', color: 'bg-yellow-100 text-yellow-800', dotColor: 'bg-yellow-400' };
  };

  const getWorkloadColor = (currentOrders: number) => {
    if (currentOrders === 0) return 'text-green-600';
    if (currentOrders <= 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  };

  const getPerformanceRating = (averageTime: number) => {
    if (averageTime <= 20) return { rating: 'Excellent', color: 'text-green-600' };
    if (averageTime <= 30) return { rating: 'Good', color: 'text-blue-600' };
    if (averageTime <= 40) return { rating: 'Average', color: 'text-yellow-600' };
    return { rating: 'Needs Improvement', color: 'text-red-600' };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">Loading partners...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Delivery Partners</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor and manage delivery partner availability</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search partners..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Partners</option>
              <option value="available">Available</option>
              <option value="busy">Busy</option>
            </select>
            
            <button
              onClick={loadPartners}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Partners</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{partners.length}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Available</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {partners.filter(p => p.isAvailable && p.currentOrders.length === 0).length}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Busy</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {partners.filter(p => p.currentOrders.length > 0).length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-xl">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Offline</p>
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {partners.filter(p => !p.isAvailable).length}
              </p>
            </div>
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl">
              <UserX className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Partners List */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-12 text-center">
        {filteredPartners.length === 0 ? (
          <>
            <Users className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No delivery partners found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery ? 'Try adjusting your search terms' : 'Add delivery partners to get started'}
            </p>
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPartners.map((partner) => {
              const statusConfig = getPartnerStatus(partner);
              const performance = getPerformanceRating(partner.averageDeliveryTime);
              
              return (
                <div key={partner._id} className="bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
                  <div className="p-6">
                    {/* Partner Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {partner.userId.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{partner.userId.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{partner.userId.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${statusConfig.dotColor}`}></div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                          {statusConfig.status}
                        </span>
                      </div>
                    </div>

                    {/* Partner Stats */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Current Orders:</span>
                        <span className={`font-medium ${getWorkloadColor(partner.currentOrders.length)}`}>
                          {partner.currentOrders.length}/3
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Avg Delivery Time:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{partner.averageDeliveryTime}m</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Performance:</span>
                        <span className={`font-medium text-sm ${performance.color}`}>
                          {performance.rating}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Joined:</span>
                        <span className="text-sm text-gray-900 dark:text-white">{formatJoinDate(partner.createdAt)}</span>
                      </div>
                    </div>

                    {/* Current Orders */}
                    {partner.currentOrders.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Current Orders:</h4>
                        <div className="space-y-2">
                          {partner.currentOrders.slice(0, 2).map((order) => (
                            <div key={order._id} className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">{order.orderId}</span>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                order.status === 'ON_ROUTE' ? 'bg-purple-100 text-purple-800' :
                                order.status === 'PICKED' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                          ))}
                          {partner.currentOrders.length > 2 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              +{partner.currentOrders.length - 2} more orders
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Location Info */}
                    {partner.location.lat !== 0 && partner.location.lng !== 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="h-4 w-4" />
                          <span>
                            Location: {partner.location.lat.toFixed(4)}, {partner.location.lng.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerAssignment;