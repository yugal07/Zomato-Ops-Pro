import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, UserCheck, AlertCircle, CheckCircle, Loader2, Shield } from 'lucide-react';

// Mock auth hook for demo
const useAuth = () => ({
  register: async (data: any) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    if (data.email === 'taken@test.com') {
      throw new Error('Email already exists');
    }
    return { user: { role: data.role } };
  },
  authState: { isLoading: false, isAuthenticated: false, user: null }
});

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'delivery'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [touchedFields, setTouchedFields] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false
  });

  const { register, authState } = useAuth();

  // Validation functions
  const validateName = (name: string) => name.trim().length >= 2;
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password: string) => {
    return password.length >= 6 && 
           /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password);
  };
  const validateConfirmPassword = (confirmPassword: string) => 
    confirmPassword === formData.password;

  // Password strength calculation
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  // Form validation
  const errors = {
    name: touchedFields.name && !validateName(formData.name) ? 'Name must be at least 2 characters' : '',
    email: touchedFields.email && !validateEmail(formData.email) ? 'Please enter a valid email address' : '',
    password: touchedFields.password && !validatePassword(formData.password) ? 'Password must contain at least one uppercase letter, one lowercase letter, and one number' : '',
    confirmPassword: touchedFields.confirmPassword && !validateConfirmPassword(formData.confirmPassword) ? 'Passwords must match' : ''
  };

  const isValid = validateName(formData.name) && 
                  validateEmail(formData.email) && 
                  validatePassword(formData.password) && 
                  validateConfirmPassword(formData.confirmPassword);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouchedFields(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid) return;

    try {
      setIsSubmitting(true);
      setError('');

      await register(formData);
      setShowSuccess(true);
      
      // Simulate redirect
      setTimeout(() => {
        alert('Registration successful! Redirecting to dashboard...');
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
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
          <h2 className="text-xl font-semibold text-gray-900">Registration Successful!</h2>
          <p className="text-gray-600">Welcome! Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg">
            <UserCheck className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join our delivery management platform
          </p>
          <p className="mt-1 text-center text-xs text-gray-500">
            Already have an account?{' '}
            <button className="font-medium text-green-600 hover:text-green-500 transition-colors">
              Sign in here
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
                      Registration failed
                    </h3>
                    <div className="mt-1 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className={`h-5 w-5 transition-colors ${
                    touchedFields.name 
                      ? errors.name 
                        ? 'text-red-400' 
                        : formData.name 
                        ? 'text-green-400' 
                        : 'text-gray-400'
                      : 'text-gray-400'
                  }`} />
                </div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`appearance-none relative block w-full pl-10 pr-3 py-3 border rounded-xl placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:z-10 sm:text-sm transition-all ${
                    errors.name
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : touchedFields.name && formData.name
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                      : 'border-gray-300 focus:border-green-500 focus:ring-green-500'
                  }`}
                  placeholder="Enter your full name"
                />
                {touchedFields.name && formData.name && !errors.name && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                )}
              </div>
              {errors.name && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.name}
                </p>
              )}
            </div>

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
                      : touchedFields.email && formData.email && !errors.email
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                      : 'border-gray-300 focus:border-green-500 focus:ring-green-500'
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

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Choose your role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'delivery' }))}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.role === 'delivery'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <User className="h-6 w-6" />
                    <span className="font-medium">Delivery Partner</span>
                    <span className="text-xs">Handle deliveries</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'manager' }))}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.role === 'manager'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Shield className="h-6 w-6" />
                    <span className="font-medium">Manager</span>
                    <span className="text-xs">Manage orders</span>
                  </div>
                </button>
              </div>
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
                      : touchedFields.password && formData.password && !errors.password
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                      : 'border-gray-300 focus:border-green-500 focus:ring-green-500'
                  }`}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-3">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${strengthColors[passwordStrength - 1] || 'bg-gray-200'}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 min-w-[60px]">
                      {strengthLabels[passwordStrength - 1] || 'Too Short'}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    <p>Password must contain:</p>
                    <ul className="mt-1 space-y-1">
                      <li className={`flex items-center ${formData.password.length >= 6 ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        At least 6 characters
                      </li>
                      <li className={`flex items-center ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        One uppercase letter
                      </li>
                      <li className={`flex items-center ${/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        One lowercase letter
                      </li>
                      <li className={`flex items-center ${/\d/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        One number
                      </li>
                    </ul>
                  </div>
                </div>
              )}
              
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={`h-5 w-5 transition-colors ${
                    touchedFields.confirmPassword 
                      ? errors.confirmPassword 
                        ? 'text-red-400' 
                        : formData.confirmPassword 
                        ? 'text-green-400' 
                        : 'text-gray-400'
                      : 'text-gray-400'
                  }`} />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`appearance-none relative block w-full pl-10 pr-12 py-3 border rounded-xl placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:z-10 sm:text-sm transition-all ${
                    errors.confirmPassword
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : touchedFields.confirmPassword && formData.confirmPassword && !errors.confirmPassword
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                      : 'border-gray-300 focus:border-green-500 focus:ring-green-500'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !isValid}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                  isSubmitting || !isValid
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transform hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Creating account...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <UserCheck className="-ml-1 mr-3 h-5 w-5" />
                    Create account
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Terms and Privacy */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            By creating an account, you agree to our{' '}
            <button className="text-green-600 hover:text-green-500">
              Terms of Service
            </button>{' '}
            and{' '}
            <button className="text-green-600 hover:text-green-500">
              Privacy Policy
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;