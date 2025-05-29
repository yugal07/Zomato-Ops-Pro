import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle, Loader2, LogIn } from 'lucide-react';

// Mock auth hook for demo
const useAuth = () => ({
  login: async (data: any) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    if (data.email === 'error@test.com') {
      throw new Error('Invalid credentials');
    }
    return { user: { role: 'manager' } };
  },
  authState: { isLoading: false, isAuthenticated: false, user: null }
});

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [touchedFields, setTouchedFields] = useState({
    email: false,
    password: false
  });

  const { login, authState } = useAuth();

  // Validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const errors = {
    email: touchedFields.email && !validateEmail(formData.email) ? 'Please enter a valid email address' : '',
    password: touchedFields.password && !validatePassword(formData.password) ? 'Password must be at least 6 characters' : ''
  };

  const isValid = validateEmail(formData.email) && validatePassword(formData.password);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'email' || field === 'password') {
      setTouchedFields(prev => ({ ...prev, [field]: true }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid) return;

    try {
      setIsSubmitting(true);
      setError('');

      await login(formData);
      setShowSuccess(true);
      
      // Simulate redirect
      setTimeout(() => {
        alert('Login successful! Redirecting to dashboard...');
      }, 1000);

    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Quick fill demo credentials
  const fillDemoCredentials = (role: 'manager' | 'delivery') => {
    const credentials = {
      manager: { email: 'manager@demo.com', password: 'password123' },
      delivery: { email: 'delivery@demo.com', password: 'password123' }
    };
    
    setFormData(prev => ({
      ...prev,
      email: credentials[role].email,
      password: credentials[role].password
    }));
    setTouchedFields({ email: true, password: true });
  };

  if (authState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600 font-medium">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Login Successful!</h2>
          <p className="text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access your dashboard
          </p>
          <p className="mt-1 text-center text-xs text-gray-500">
            Or{' '}
            <button className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
              create a new account
            </button>
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="space-y-6">
            {/* Error Alert */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Sign in failed
                    </h3>
                    <div className="mt-1 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className={`h-5 w-5 transition-colors ${
                    touchedFields.email 
                      ? errors.email 
                        ? 'text-red-400' 
                        : formData.email 
                        ? 'text-green-400' 
                        : 'text-gray-400'
                      : 'text-gray-400'
                  }`} />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`appearance-none relative block w-full pl-10 pr-3 py-3 border rounded-xl placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:z-10 sm:text-sm transition-all ${
                    errors.email
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : touchedFields.email && formData.email
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  placeholder="Enter your email address"
                />
                {touchedFields.email && formData.email && !errors.email && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                )}
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={`h-5 w-5 transition-colors ${
                    touchedFields.password 
                      ? errors.password 
                        ? 'text-red-400' 
                        : formData.password 
                        ? 'text-green-400' 
                        : 'text-gray-400'
                      : 'text-gray-400'
                  }`} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`appearance-none relative block w-full pl-10 pr-12 py-3 border rounded-xl placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:z-10 sm:text-sm transition-all ${
                    errors.password
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : touchedFields.password && formData.password
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <button className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                  Forgot password?
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !isValid}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isSubmitting || !isValid
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <LogIn className="-ml-1 mr-3 h-5 w-5" />
                    Sign in
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 text-center">
            Try Demo Accounts
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => fillDemoCredentials('manager')}
              className="p-3 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
            >
              <div className="font-medium">Manager</div>
              <div className="text-blue-600">manager@demo.com</div>
            </button>
            <button
              onClick={() => fillDemoCredentials('delivery')}
              className="p-3 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
            >
              <div className="font-medium">Delivery Partner</div>
              <div className="text-green-600">delivery@demo.com</div>
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-3">
            Password for both: <span className="font-mono">password123</span>
          </p>
        </div>

        {/* Footer Links */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our{' '}
            <button className="text-blue-600 hover:text-blue-500">
              Terms of Service
            </button>{' '}
            and{' '}
            <button className="text-blue-600 hover:text-blue-500">
              Privacy Policy
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;