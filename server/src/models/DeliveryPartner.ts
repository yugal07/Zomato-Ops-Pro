import { Schema, model, Document } from 'mongoose';
import { IDeliveryPartner } from '../types/delivery.types';

interface IDeliveryPartnerDocument extends Omit<IDeliveryPartner, '_id'>, Document {}

const deliveryPartnerSchema = new Schema<IDeliveryPartnerDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  currentOrders: [{
    type: Schema.Types.ObjectId,
    ref: 'Order'
  }],
  location: {
    lat: {
      type: Number,
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    lng: {
      type: Number,
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    }
  },
  averageDeliveryTime: {
    type: Number,
    default: 30,
    min: [5, 'Average delivery time must be at least 5 minutes']
  }
}, {
  timestamps: true
});

// Indexes
deliveryPartnerSchema.index({ userId: 1 });
deliveryPartnerSchema.index({ isAvailable: 1 });
deliveryPartnerSchema.index({ 'location.lat': 1, 'location.lng': 1 });

// Validation: Max 3 concurrent orders
deliveryPartnerSchema.pre('save', function(next) {
  if (this.currentOrders.length > 3) {
    next(new Error('Delivery partner cannot have more than 3 concurrent orders'));
  } else {
    next();
  }
});

export default model<IDeliveryPartnerDocument>('DeliveryPartner', deliveryPartnerSchema);