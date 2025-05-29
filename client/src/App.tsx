import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';
import Header from './components/common/Header';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import LoadingSpinner from './components/common/LoadingSpinner';

// Import Manager Components
import ManagerDashboard from './components/manager/ManagerDashboard';
import OrderTable from './components/manager/OrderTable';
import PartnerAssignment from './components/manager/PartnerAssignment';
import AnalyticsDashboard from './components/manager/AnalyticsDashboard';

import './App.css';

// Placeholder component for delivery dashboard (to be implemented later)
const DeliveryDashboard = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900">Delivery Dashboard</h1>
    <p className="text-gray-600 mt-2">Welcome to the delivery partner dashboard. This will be implemented in the next phase.</p>
  </div>
);

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-gray-600 mb-4">Page not found</p>
      <a href="/" className="text-blue-600 hover:text-blue-500">
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
    <AuthProvider>
      <Router>
        <div className="App min-h-screen bg-gray-50">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <main>
                      <Routes>
                        {/* Root redirect based on role */}
                        <Route
                          path="/"
                          element={<RoleBasedRedirect />}
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
  );
}

export default App;
