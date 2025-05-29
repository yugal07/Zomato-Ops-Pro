export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'manager' | 'delivery';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  role: 'manager' | 'delivery';
}

export interface AuthContextType {
  authState: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface OrderMetrics {
  totalOrders: number;
  ordersByStatus: Record<string, number>;
  averagePrepTime: number;
  averageDeliveryTime: number;
  recentOrders: any[];
}

export interface DeliveryMetrics {
  totalPartners: number;
  availablePartners: number;
}

export interface AnalyticsData {
  orderMetrics: {
    totalOrders: number;
    ordersByStatus: Record<string, number>;
    averagePrepTime: number;
    averageDeliveryTime: number;
    recentOrders: any[];
  };
  deliveryMetrics: {
    totalPartners: number;
    availablePartners: number;
    busyPartners: number;
    averageOrdersPerPartner: number;
    partnerWorkload: Array<{
      partnerId: string;
      partnerName: string;
      currentOrders: number;
      isAvailable: boolean;
    }>;
  };
  realTimeData: {
    connectedUsers: number;
    activeOrders: number;
    pendingAssignments: number;
  };
}

export interface OrdersResponse {
  data: any[];
  totalPages: number;
}

export interface PartnersResponse {
  [key: string]: any;
} 