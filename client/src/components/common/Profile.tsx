import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Truck, Clock, MapPin, Activity, Edit3, Save, X, CheckCircle } from 'lucide-react';
import apiService from '../../services/api';
import LoadingSpinner from './LoadingSpinner';

interface ProfileData {
  _id: string;
  email: string;
  name: string;
  role: 'manager' | 'delivery';
  isActive: boolean;
  createdAt: string;
  deliveryProfile?: {
    isAvailable: boolean;
    currentOrders: string[]; // Array of order IDs
    location?: {
      lat: number;
      lng: number;
      address?: string;
    };
    averageDeliveryTime: number;
  };
}

const Profile: React.FC = () => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProfile();
      if (response.success && response.data) {
        setProfileData(response.data);
        setEditedName(response.data.name);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = async () => {
    if (!editedName.trim() || editedName === profileData?.name) {
      setIsEditing(false);
      return;
    }

    try {
      setSaving(true);
      // Note: You'll need to implement the update profile endpoint
      // await apiService.put('/auth/profile', { name: editedName });
      
      // For now, just update locally
      if (profileData) {
        setProfileData({ ...profileData, name: editedName });
      }
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedName(profileData?.name || '');
    setIsEditing(false);
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading profile..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Error Loading Profile</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={loadProfile}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return null;
  }

  const isManager = profileData.role === 'manager';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-xl border border-white/30">
                <span className="text-white text-4xl font-bold">
                  {getUserInitials(profileData.name)}
                </span>
              </div>
              <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-white ${
                profileData.isActive ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
            </div>

            {/* User Info */}
            <div className="text-center md:text-left flex-1">
              {isEditing ? (
                <div className="flex items-center justify-center md:justify-start space-x-3 mb-2">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="text-3xl font-bold text-white bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/50"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={saving}
                    className="p-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
                  >
                    <Save className="h-5 w-5 text-white" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-white" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center md:justify-start space-x-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-white">{profileData.name}</h1>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  >
                    <Edit3 className="h-5 w-5 text-white" />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
                {isManager ? (
                  <div className="flex items-center space-x-2 bg-blue-500/30 backdrop-blur-sm px-3 py-1 rounded-full">
                    <Shield className="h-4 w-4 text-white" />
                    <span className="text-white font-medium">Manager</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 bg-green-500/30 backdrop-blur-sm px-3 py-1 rounded-full">
                    <Truck className="h-4 w-4 text-white" />
                    <span className="text-white font-medium">Delivery Partner</span>
                  </div>
                )}
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  profileData.isActive 
                    ? 'bg-green-500/30 text-white' 
                    : 'bg-red-500/30 text-white'
                }`}>
                  {profileData.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>

              <p className="text-blue-100 text-lg">{profileData.email}</p>
              <p className="text-blue-200 text-sm mt-1">
                Member since {formatDate(profileData.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Quick Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-500" />
                Contact Information
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Address</p>
                    <p className="text-gray-900 dark:text-white font-medium">{profileData.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Status */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-green-500" />
                Account Status
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${profileData.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`text-sm font-medium ${
                      profileData.isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {profileData.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Member Since</span>
                  <span className="text-sm text-gray-900 dark:text-white">{formatDate(profileData.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Role-specific Information */}
            {isManager ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Shield className="h-6 w-6 mr-3 text-blue-500" />
                  Manager Dashboard
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                        <Activity className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Role</p>
                        <p className="text-lg font-bold text-blue-900 dark:text-blue-100">Restaurant Manager</p>
                      </div>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Full system access and management capabilities</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">Access Level</p>
                        <p className="text-lg font-bold text-green-900 dark:text-green-100">Full Access</p>
                      </div>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-300">Complete control over orders and delivery partners</p>
                  </div>
                </div>
              </div>
            ) : (
              profileData.deliveryProfile && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    <Truck className="h-6 w-6 mr-3 text-green-500" />
                    Delivery Dashboard
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          profileData.deliveryProfile.isAvailable ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                          <Activity className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Availability</p>
                          <p className={`text-lg font-bold ${
                            profileData.deliveryProfile.isAvailable 
                              ? 'text-green-900 dark:text-green-100' 
                              : 'text-red-900 dark:text-red-100'
                          }`}>
                            {profileData.deliveryProfile.isAvailable ? 'Available' : 'Unavailable'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                          <Clock className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Avg Delivery Time</p>
                          <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                            {profileData.deliveryProfile.averageDeliveryTime} min
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                      <div className="flex items-center space-x-3">
                        <Truck className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Orders</p>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {Array.isArray(profileData.deliveryProfile.currentOrders) 
                              ? profileData.deliveryProfile.currentOrders.length 
                              : 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    {profileData.deliveryProfile.location ? (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                        <div className="flex items-center space-x-3">
                          <MapPin className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Location</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {profileData.deliveryProfile.location.address || 
                               (profileData.deliveryProfile.location.lat !== 0 && profileData.deliveryProfile.location.lng !== 0
                                 ? `${profileData.deliveryProfile.location.lat.toFixed(4)}, ${profileData.deliveryProfile.location.lng.toFixed(4)}`
                                 : 'Location not set')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                        <div className="flex items-center space-x-3">
                          <MapPin className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Location</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Not available</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 