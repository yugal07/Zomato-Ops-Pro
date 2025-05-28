export enum UserRole {
  MANAGER = 'manager',
  DELIVERY = 'delivery'
}

export interface IUser {
  _id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}