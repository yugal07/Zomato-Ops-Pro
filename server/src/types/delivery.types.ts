import { Types } from 'mongoose';

export interface IDeliveryPartner {
  _id: string;
  userId: Types.ObjectId;
  isAvailable: boolean;
  currentOrders: Types.ObjectId[];
  location: {
    lat: number;
    lng: number;
  };
  averageDeliveryTime: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
}

export interface LocationUpdate {
  lat: number;
  lng: number;
}