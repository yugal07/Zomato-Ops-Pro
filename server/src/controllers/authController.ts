import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { RegisterData, LoginCredentials } from '../types/auth.types';
import { validateRegistrationData } from '../utils/validators';
import { AuthRequest } from '../middleware/auth';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userData: RegisterData = req.body;

      // Validate input
      const validation = validateRegistrationData(userData);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
        return;
      }

      const result = await AuthService.register(userData);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const credentials: LoginCredentials = req.body;

      if (!credentials.email || !credentials.password) {
        res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
        return;
      }

      const result = await AuthService.login(credentials);

      res.json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const profile = await AuthService.getUserProfile(req.user._id);

      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(error);
    }
  }

  static logout(req: AuthRequest, res: Response): void {
    // For JWT, logout is handled client-side by removing the token
    // In future, you could implement token blacklisting here
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  }
}