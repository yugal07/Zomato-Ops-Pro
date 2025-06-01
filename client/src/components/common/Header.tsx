// client/src/components/common/Header.tsx - Enhanced with Socket Integration
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LogOut, 
  User, 
  Menu, 
  X, 
  Shield, 
  Truck,
  Search,
  ChevronDown,
  Activity,
  Package,
  Calendar,
  Wifi,
  WifiOff,
  Radio
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocketContext } from '../../context/SocketContext';
import ThemeToggle from './ThemeToggle';
import NotificationCenter from './NotificationCenter';
import RealTimeOrderUpdates from './RealTimeOrderUpdates';

const Header: React.FC = () => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  
  const { authState, logout } = useAuth();
  const { 
    connected, 
    connecting, 
    error, 
    reconnectAttempt,
    isLocationTracking,
    startLocationTracking,
    stopLocationTracking,
    updatePartnerStatus
  } = useSocketContext();
  
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavigation = (href: string) => {
    navigate(href);
    setIsMobileMenuOpen(false);
  };

  const toggleLocationTracking = () => {
    if (isLocationTracking) {
      stopLocationTracking();
    } else {
      startLocationTracking();
    }
  };

  const handlePartnerStatusChange = (status: 'available' | 'busy' | 'offline' | 'on_break') => {
    updatePartnerStatus(status);
  };

  if (!authState.isAuthenticated || !authState.user) {
    return null;
  }

  const { user } = authState;
  const isManager = user.role === 'manager';

  const navigationItems = isManager
    ? [
        { name: 'Dashboard', href: '/manager/dashboard', icon: Activity },
        { name: 'Orders', href: '/manager/orders', icon: Package },
        { name: 'Partners', href: '/manager/partners', icon: User },
        { name: 'Analytics', href: '/manager/analytics', icon: Activity },
      ]
    : [
        { name: 'Dashboard', href: '/delivery/dashboard', icon: Activity },
        { name: 'My Orders', href: '/delivery/orders', icon: Package },
        { name: 'History', href: '/delivery/history', icon: Calendar },
      ];

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isCurrentPath = (path: string) => {
    return location.pathname === path;
  };

  const getConnectionStatusInfo = () => {
    if (connected) {
      return {
        icon: Wifi,
        color: 'text-green-500',
        text: 'Connected',
        description: 'Real-time updates active'
      };
    } else if (connecting || reconnectAttempt > 0) {
      return {
        icon: Radio,
        color: 'text-yellow-500',
        text: reconnectAttempt > 0 ? `Reconnecting (${reconnectAttempt})` : 'Connecting...',
        description: 'Attempting to establish connection'
      };
    } else {
      return {
        icon: WifiOff,
        color: 'text-red-500',
        text: 'Disconnected',
        description: error || 'Connection lost'
      };
    }
  };

  const connectionStatus = getConnectionStatusInfo();
  const ConnectionIcon = connectionStatus.icon;

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <span className="text-white font-bold text-sm">DM</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold text-gray-900 dark:text-white">DeliveryManager</span>
                <div className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                  {isManager ? 'Manager Portal' : 'Partner Portal'}
                </div>
              </div>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className={`h-5 w-5 transition-colors ${isSearchFocused ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'}`} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                placeholder="Search orders, partners, or customers..."
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-1">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = isCurrentPath(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-3">
            {/* Connection Status */}
            <div className={`flex items-center space-x-2 px-2 py-1 rounded-lg text-xs ${connectionStatus.color}`}>
              <ConnectionIcon className="h-4 w-4" />
              <span className="hidden sm:inline">{connectionStatus.text}</span>
            </div>

            {/* Real-time Updates Component */}
            <RealTimeOrderUpdates className="hidden md:block" />

            {/* Delivery Partner Controls */}
            {!isManager && (
              <div className="flex items-center space-x-2">
                {/* Location Tracking Toggle */}
                <button
                  onClick={toggleLocationTracking}
                  className={`p-2 rounded-lg transition-colors ${
                    isLocationTracking
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title={isLocationTracking ? 'Stop location tracking' : 'Start location tracking'}
                >
                  <Radio className="h-4 w-4" />
                </button>

                {/* Quick Status Buttons */}
                <div className="hidden lg:flex items-center space-x-1">
                  <button
                    onClick={() => handlePartnerStatusChange('available')}
                    className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                  >
                    Available
                  </button>
                  <button
                    onClick={() => handlePartnerStatusChange('on_break')}
                    className="px-2 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
                  >
                    Break
                  </button>
                </div>
              </div>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notification Center */}
            <NotificationCenter />

            {/* Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={toggleProfileDropdown}
                className="flex items-center space-x-3 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 p-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-white text-xs font-semibold">
                    {getUserInitials(user.name)}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-32">
                    {user.name}
                  </p>
                  <div className="flex items-center space-x-1">
                    {isManager ? (
                      <Shield className="h-3 w-3 text-blue-500" />
                    ) : (
                      <Truck className="h-3 w-3 text-green-500" />
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {user.role}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-sm">
                        <span className="text-white text-sm font-semibold">
                          {getUserInitials(user.name)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          {isManager ? (
                            <Shield className="h-3 w-3 text-blue-500" />
                          ) : (
                            <Truck className="h-3 w-3 text-green-500" />
                          )}
                          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {user.role}
                          </span>
                          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {connectionStatus.text}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Connection Status Details */}
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Connection Status</span>
                      <div className={`flex items-center space-x-1 ${connectionStatus.color}`}>
                        <ConnectionIcon className="h-3 w-3" />
                        <span className="text-xs">{connectionStatus.text}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {connectionStatus.description}
                    </p>
                  </div>

                  {/* Delivery Partner Specific Controls */}
                  {!isManager && (
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Location Tracking</span>
                          <button
                            onClick={toggleLocationTracking}
                            className={`px-2 py-1 text-xs rounded ${
                              isLocationTracking
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            {isLocationTracking ? 'Stop' : 'Start'}
                          </button>
                        </div>
                        
                        <div>
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-2">Status</span>
                          <div className="grid grid-cols-2 gap-1">
                            <button
                              onClick={() => handlePartnerStatusChange('available')}
                              className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                            >
                              Available
                            </button>
                            <button
                              onClick={() => handlePartnerStatusChange('busy')}
                              className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
                            >
                              Busy
                            </button>
                            <button
                              onClick={() => handlePartnerStatusChange('on_break')}
                              className="px-2 py-1 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                            >
                              On Break
                            </button>
                            <button
                              onClick={() => handlePartnerStatusChange('offline')}
                              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                              Offline
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-2">
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <User className="h-4 w-4 mr-3" />
                      View Profile
                    </Link>
                  </div>
                  
                  <div className="border-t border-gray-100 dark:border-gray-700 p-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-3 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
            {/* Mobile Search */}
            <div className="px-4 mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search..."
                />
              </div>
            </div>

            {/* Mobile Connection Status */}
            <div className="px-4 mb-4">
              <div className={`flex items-center justify-between p-3 rounded-lg border ${
                connected 
                  ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' 
                  : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
              }`}>
                <div className="flex items-center space-x-2">
                  <ConnectionIcon className={`h-4 w-4 ${connectionStatus.color}`} />
                  <span className={`text-sm font-medium ${connectionStatus.color}`}>
                    {connectionStatus.text}
                  </span>
                </div>
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              </div>
            </div>

            {/* Mobile Real-time Updates */}
            <div className="px-4 mb-4">
              <RealTimeOrderUpdates showToasts={false} />
            </div>

            {/* Mobile Delivery Partner Controls */}
            {!isManager && (
              <div className="px-4 mb-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Actions</span>
                    <button
                      onClick={toggleLocationTracking}
                      className={`px-2 py-1 text-xs rounded ${
                        isLocationTracking
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {isLocationTracking ? '📍 Tracking' : '📍 Start GPS'}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handlePartnerStatusChange('available')}
                      className="px-3 py-2 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                    >
                      🟢 Available
                    </button>
                    <button
                      onClick={() => handlePartnerStatusChange('on_break')}
                      className="px-3 py-2 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                    >
                      ⏸️ Break
                    </button>
                  </div>
                </div>
              </div>
            )}

            <nav className="space-y-1 px-4">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = isCurrentPath(item.href);
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.href)}
                    className={`flex items-center space-x-3 w-full px-3 py-2 text-base font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <IconComponent className="h-5 w-5" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;