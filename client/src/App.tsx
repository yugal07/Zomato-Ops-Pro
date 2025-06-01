import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import PrivateRoute from './components/common/PrivateRoute';
import Header from './components/common/Header';
import Profile from './components/common/Profile';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import LoadingSpinner from './components/common/LoadingSpinner';

// Import Manager Components
import ManagerDashboard from './components/manager/ManagerDashboard';
import OrderTable from './components/manager/OrderTable';
import PartnerAssignment from './components/manager/PartnerAssignment';
import AnalyticsDashboard from './components/manager/AnalyticsDashboard';

// Import Delivery Components
import DeliveryDashboard from './components/delivery/DeliveryDashboard';
import DeliveryOrders from './components/delivery/DeliveryOrders';
import DeliveryHistory from './components/delivery/DeliveryHistory';

import './App.css';

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-4">Page not found</p>
      <a href="/" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
        Go back home
      </a>
    </div>
  </div>
);

// Component to redirect users to their role-specific dashboard
const RoleBasedRedirect: React.FC = () => {
  const { authState } = useAuth();
  
  if (authState.isLoading) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }
  
  if (!authState.user) {
    return <Navigate to="/login" replace />;
  }
  
  const redirectPath = authState.user.role === 'manager' 
    ? '/manager/dashboard' 
    : '/delivery/dashboard';
    
  return <Navigate to={redirectPath} replace />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected routes */}
              <Route
                path="/*"
                element={
                  <PrivateRoute>
                    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
                      <Header />
                      <main>
                        <Routes>
                          {/* Root redirect based on role */}
                          <Route
                            path="/"
                            element={<RoleBasedRedirect />}
                          />
                          
                          {/* Profile route - accessible to all authenticated users */}
                          <Route
                            path="/profile"
                            element={<Profile />}
                          />
                          
                          {/* Manager routes */}
                          <Route
                            path="/manager/dashboard"
                            element={
                              <PrivateRoute allowedRoles={['manager']}>
                                <ManagerDashboard />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/manager/orders"
                            element={
                              <PrivateRoute allowedRoles={['manager']}>
                                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                                  <OrderTable onRefresh={() => {}} />
                                </div>
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/manager/partners"
                            element={
                              <PrivateRoute allowedRoles={['manager']}>
                                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                                  <PartnerAssignment />
                                </div>
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/manager/analytics"
                            element={
                              <PrivateRoute allowedRoles={['manager']}>
                                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                                  <AnalyticsDashboard />
                                </div>
                              </PrivateRoute>
                            }
                          />
                          
                          {/* Delivery routes */}
                          <Route
                            path="/delivery/dashboard"
                            element={
                              <PrivateRoute allowedRoles={['delivery']}>
                                <DeliveryDashboard />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/delivery/orders"
                            element={
                              <PrivateRoute allowedRoles={['delivery']}>
                                <DeliveryOrders />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/delivery/history"
                            element={
                              <PrivateRoute allowedRoles={['delivery']}>
                                <DeliveryHistory />
                              </PrivateRoute>
                            }
                          />
                          
                          {/* 404 route */}
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </main>
                    </div>
                  </PrivateRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;