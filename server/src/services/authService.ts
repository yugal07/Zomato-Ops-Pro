import jwt, { SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import User from '../models/User';
import DeliveryPartner from '../models/DeliveryPartner';
import { RegisterData, LoginCredentials, JWTPayload, UserRole } from '../types/auth.types';
import { authConfig } from '../config/auth';
import { AppError } from '../middleware/errorHandler';

export class AuthService {
  static generateToken(payload: JWTPayload): string {
    const options: SignOptions = {
      expiresIn: authConfig.jwtExpiresIn as StringValue
    };
    
    return jwt.sign(payload, authConfig.jwtSecret, options);
  }

  static async register(userData: RegisterData) {
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new AppError('User already exists with this email', 400);
    }

    // Create user
    const user = await User.create(userData);

    // If delivery partner, create delivery partner profile
    if (userData.role === UserRole.DELIVERY) {
      await DeliveryPartner.create({
        userId: user._id,
        isAvailable: true,
        currentOrders: [],
        location: { lat: 0, lng: 0 },
        averageDeliveryTime: 30
      });
    }

    // Generate token
    const tokenPayload: JWTPayload = {
      userId: (user._id as any).toString(),
      email: user.email,
      role: user.role
    };

    const token = this.generateToken(tokenPayload);

    return {
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive
      },
      token
    };
  }

  static async login(credentials: LoginCredentials) {
    const { email, password } = credentials;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.isActive) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate token
    const tokenPayload: JWTPayload = {
      userId: (user._id as any).toString(),
      email: user.email,
      role: user.role
    };

    const token = this.generateToken(tokenPayload);

    return {
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive
      },
      token
    };
  }

  static async getUserProfile(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    let profileData: any = {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt
    };

    // If delivery partner, include delivery partner data
    if (user.role === UserRole.DELIVERY) {
      const deliveryPartner = await DeliveryPartner.findOne({ userId: user._id });
      if (deliveryPartner) {
        profileData.deliveryProfile = {
          isAvailable: deliveryPartner.isAvailable,
          currentOrders: deliveryPartner.currentOrders,
          location: deliveryPartner.location,
          averageDeliveryTime: deliveryPartner.averageDeliveryTime
        };
      }
    }

    return profileData;
  }
}