import { Types } from 'mongoose';

export enum OrderStatus {
  PREP = 'PREP',
  PICKED = 'PICKED',
  ON_ROUTE = 'ON_ROUTE',
  DELIVERED = 'DELIVERED'
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface IOrder {
  _id: string;
  orderId: string;
  items: OrderItem[];
  prepTime: number; // in minutes
  status: OrderStatus;
  assignedPartner?: Types.ObjectId;
  dispatchTime?: Date;
  estimatedDeliveryTime?: Date;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderData {
  orderId?: string;
  items: OrderItem[];
  prepTime: number;
}

export interface AssignPartnerData {
  orderId: string;
  partnerId: string;
}

export interface StatusUpdateData {
  orderId: string;
  status: OrderStatus;
}