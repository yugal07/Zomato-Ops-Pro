import { Schema, model, Document } from 'mongoose';
import { IOrder, OrderStatus, OrderItem } from '../types/order.types';

interface IOrderDocument extends Omit<IOrder, '_id'>, Document {}

const orderItemSchema = new Schema<OrderItem>({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    maxlength: [100, 'Item name cannot exceed 100 characters']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  }
}, { _id: false });

const orderSchema = new Schema<IOrderDocument>({
  orderId: {
    type: String,
    required: [true, 'Order ID is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  items: {
    type: [orderItemSchema],
    required: [true, 'Order items are required'],
    validate: {
      validator: function(items: OrderItem[]) {
        return items && items.length > 0;
      },
      message: 'Order must have at least one item'
    }
  },
  prepTime: {
    type: Number,
    required: [true, 'Preparation time is required'],
    min: [1, 'Preparation time must be at least 1 minute'],
    max: [120, 'Preparation time cannot exceed 120 minutes']
  },
  status: {
    type: String,
    enum: Object.values(OrderStatus),
    default: OrderStatus.PREP
  },
  assignedPartner: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  dispatchTime: {
    type: Date
  },
  estimatedDeliveryTime: {
    type: Date
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by is required']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
orderSchema.index({ orderId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ assignedPartner: 1 });
orderSchema.index({ createdBy: 1 });
orderSchema.index({ createdAt: -1 });

// Auto-generate orderId if not provided
orderSchema.pre('save', async function(next) {
  if (!this.orderId) {
    const count = await model('Order').countDocuments();
    this.orderId = `ORD${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

export default model<IOrderDocument>('Order', orderSchema);