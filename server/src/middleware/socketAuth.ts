import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { authConfig } from '../config/auth';
import { JWTPayload } from '../types/auth.types';

export interface AuthenticatedSocket extends Socket {
  user: JWTPayload;
}

export const authenticateSocketMiddleware = (socket: Socket, next: (err?: Error) => void) => {
  try {
    const token = socket.handshake.auth.token || 
                  socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    const decoded = jwt.verify(token, authConfig.jwtSecret) as JWTPayload;
    (socket as AuthenticatedSocket).user = decoded;
    next();
  } catch (error) {
    next(new Error('Invalid authentication token'));
  }
};