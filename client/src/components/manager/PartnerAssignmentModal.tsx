import React, { useState, useEffect } from 'react';
import { X, User, Clock, Package, CheckCircle, AlertCircle, Truck } from 'lucide-react';
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
  currentOrders: any[];
  location: {
    lat: number;
    lng: number;
  };
  averageDeliveryTime: number;
}

interface Order {
  _id: string;
  orderId: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  prepTime: number;
  status: string;
}

interface PartnerAssignmentModalProps {
  order: Order;
  onClose: () => void;
  onSuccess: () => void;
}

const PartnerAssignmentModal: React.FC<PartnerAssignmentModalProps> = ({
  order,
  onClose,
  onSuccess
}) => {
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadAvailablePartners();
  }, []);

  const loadAvailablePartners = async () => {
    try {
      setLoading(true);
      const response = await apiService.get<ApiResponse<DeliveryPartner[]>>('/delivery/partners');
      setPartners(response.data || []);
    } catch (error) {
      console.error('Failed to load partners:', error);
      setError('Failed to load available partners');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPartner = async () => {
    if (!selectedPartnerId) {
      setError('Please select a delivery partner');
      return;
    }

    try {
      setAssigning(true);
      setError('');

      await apiService.put(`/orders/${order._id}/assign`, {
        partnerId: selectedPartnerId
      });

      onSuccess();
    } catch (error: any) {
      setError(error.message || 'Failed to assign partner');
    } finally {
      setAssigning(false);
    }
  };

  const calculateDispatchTime = (prepTime: number, deliveryTime: number) => {
    const now = new Date();
    const totalTime = prepTime + deliveryTime;
    const dispatchTime = new Date(now.getTime() + totalTime * 60000);
    return dispatchTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getWorkloadColor = (currentOrders: number) => {
    if (currentOrders === 0) return 'text-green-600 bg-green-100';
    if (currentOrders <= 2) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getAvailabilityStatus = (partner: DeliveryPartner) => {
    if (!partner.isAvailable) return { status: 'Unavailable', color: 'text-red-600' };
    if (partner.currentOrders.length >= 3) return { status: 'At Capacity', color: 'text-red-600' };
    if (partner.currentOrders.length === 0) return { status: 'Free', color: 'text-green-600' };
    return { status: 'Busy', color: 'text-yellow-600' };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Truck className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Assign Delivery Partner</h2>
              <p className="text-sm text-gray-500">Order {order.orderId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Order Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{order.prepTime}m prep time</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">
                  Status: {order.status}
                </span>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-600 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Partners List */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Delivery Partners</h3>
            
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-600">Loading partners...</span>
                </div>
              </div>
            ) : partners.length === 0 ? (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Partners Available</h3>
                <p className="text-gray-500">All delivery partners are currently busy or unavailable</p>
              </div>
            ) : (
              <div className="space-y-3">
                {partners.map((partner) => {
                  const availability = getAvailabilityStatus(partner);
                  const canAssign = partner.isAvailable && partner.currentOrders.length < 3;
                  const estimatedDispatch = calculateDispatchTime(order.prepTime, partner.averageDeliveryTime);
                  
                  return (
                    <div
                      key={partner._id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedPartnerId === partner.userId._id
                          ? 'border-blue-500 bg-blue-50'
                          : canAssign
                          ? 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                          : 'border-gray-200 bg-gray-50 opacity-75 cursor-not-allowed'
                      }`}
                      onClick={() => canAssign && setSelectedPartnerId(partner.userId._id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {/* Partner Avatar */}
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {partner.userId.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                          </div>

                          {/* Partner Info */}
                          <div>
                            <h4 className="font-medium text-gray-900">{partner.userId.name}</h4>
                            <p className="text-sm text-gray-500">{partner.userId.email}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className={`text-xs font-medium ${availability.color}`}>
                                {availability.status}
                              </span>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                  Avg: {partner.averageDeliveryTime}m
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          {/* Current Workload */}
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getWorkloadColor(partner.currentOrders.length)}`}>
                            {partner.currentOrders.length}/3 orders
                          </div>
                          
                          {/* Estimated Dispatch Time */}
                          {canAssign && (
                            <div className="text-xs text-gray-500 mt-1">
                              Est. dispatch: {estimatedDispatch}
                            </div>
                          )}

                          {/* Selection Indicator */}
                          {selectedPartnerId === partner.userId._id && (
                            <CheckCircle className="h-5 w-5 text-blue-600 mt-2 ml-auto" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAssignPartner}
              disabled={!selectedPartnerId || assigning || partners.length === 0}
              className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                !selectedPartnerId || assigning || partners.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {assigning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Assigning...</span>
                </>
              ) : (
                <>
                  <Truck className="h-4 w-4" />
                  <span>Assign Partner</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerAssignmentModal;