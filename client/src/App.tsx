import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';
import Header from './components/common/Header';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import LoadingSpinner from './components/common/LoadingSpinner';
import './App.css';

// Placeholder components for future implementation
const ManagerDashboard = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
    <p className="text-gray-600 mt-2">Welcome to the manager dashboard. This will be implemented in the next phase.</p>
  </div>
);

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
