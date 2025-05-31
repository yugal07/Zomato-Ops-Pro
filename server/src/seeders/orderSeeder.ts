import Order from '../models/Order';
import User from '../models/User';
import DeliveryPartner from '../models/DeliveryPartner';
import { UserRole } from '../types/auth.types';
import { OrderStatus, OrderItem } from '../types/order.types';

// Realistic food items with Indian cuisine focus
const foodItems: OrderItem[] = [
  { name: 'Butter Chicken', quantity: 1, price: 320 },
  { name: 'Biryani (Chicken)', quantity: 1, price: 280 },
  { name: 'Paneer Tikka Masala', quantity: 1, price: 250 },
  { name: 'Dal Makhani', quantity: 1, price: 180 },
  { name: 'Naan (2 pcs)', quantity: 1, price: 80 },
  { name: 'Garlic Naan (2 pcs)', quantity: 1, price: 100 },
  { name: 'Jeera Rice', quantity: 1, price: 120 },
  { name: 'Tandoori Chicken (Half)', quantity: 1, price: 350 },
  { name: 'Masala Dosa', quantity: 1, price: 150 },
  { name: 'Idli Sambar (4 pcs)', quantity: 1, price: 120 },
  { name: 'Vada Pav (2 pcs)', quantity: 1, price: 60 },
  { name: 'Pav Bhaji', quantity: 1, price: 140 },
  { name: 'Chole Bhature', quantity: 1, price: 160 },
  { name: 'Rajma Rice', quantity: 1, price: 180 },
  { name: 'Aloo Paratha (2 pcs)', quantity: 1, price: 120 },
  { name: 'Samosa (4 pcs)', quantity: 1, price: 80 },
  { name: 'Gulab Jamun (4 pcs)', quantity: 1, price: 100 },
  { name: 'Lassi (Sweet)', quantity: 1, price: 80 },
  { name: 'Mango Kulfi', quantity: 1, price: 90 },
  { name: 'Masala Chai', quantity: 1, price: 40 }
];

// Generate random order items
const generateOrderItems = (): OrderItem[] => {
  const numItems = Math.floor(Math.random() * 4) + 1; // 1-4 items per order
  const selectedItems: OrderItem[] = [];
  
  for (let i = 0; i < numItems; i++) {
    const randomItem = foodItems[Math.floor(Math.random() * foodItems.length)];
    const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 quantity
    
    selectedItems.push({
      ...randomItem,
      quantity
    });
  }
  
  return selectedItems;
};

// Generate tracking updates based on order status
const generateTrackingUpdates = (status: OrderStatus, createdAt: Date) => {
  const updates = [];
  const baseTime = new Date(createdAt);
  
  // Order placed
  updates.push({
    status: OrderStatus.PREP,
    timestamp: baseTime,
    message: 'Order received and being prepared'
  });
  
  if (status === OrderStatus.PREP) return updates;
  
  // Order picked up
  const pickupTime = new Date(baseTime.getTime() + Math.random() * 30 * 60000); // 0-30 mins later
  updates.push({
    status: OrderStatus.PICKED,
    timestamp: pickupTime,
    message: 'Order picked up by delivery partner'
  });
  
  if (status === OrderStatus.PICKED) return updates;
  
  // On route
  const onRouteTime = new Date(pickupTime.getTime() + Math.random() * 10 * 60000); // 0-10 mins later
  updates.push({
    status: OrderStatus.ON_ROUTE,
    timestamp: onRouteTime,
    location: {
      lat: 19.0760 + (Math.random() - 0.5) * 0.1,
      lng: 72.8777 + (Math.random() - 0.5) * 0.1
    },
    message: 'Order is on the way to delivery location'
  });
  
  if (status === OrderStatus.ON_ROUTE) return updates;
  
  // Delivered
  const deliveredTime = new Date(onRouteTime.getTime() + Math.random() * 20 * 60000); // 0-20 mins later
  updates.push({
    status: OrderStatus.DELIVERED,
    timestamp: deliveredTime,
    message: 'Order delivered successfully'
  });
  
  return updates;
};

// Generate unique order ID
const generateOrderId = (index: number): string => {
  return `ORD${String(index + 1).padStart(6, '0')}`;
};

export const seedOrders = async (): Promise<void> => {
  try {
    console.log('🌱 Seeding orders...');
    
    // Clear existing orders
    await Order.deleteMany({});
    console.log('✅ Cleared existing orders');
    
    // Get managers and delivery partners
    const managers = await User.find({ role: UserRole.MANAGER });
    const deliveryPartners = await DeliveryPartner.find().populate('userId');
    
    if (managers.length === 0) {
      console.log('⚠️  No managers found. Please seed users first.');
      return;
    }
    
    const orderStatuses = Object.values(OrderStatus);
    const ordersToCreate = [];
    
    // Create 50 orders with varied data
    for (let i = 0; i < 50; i++) {
      const randomManager = managers[Math.floor(Math.random() * managers.length)];
      const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
      const items = generateOrderItems();
      const prepTime = Math.floor(Math.random() * 30) + 15; // 15-45 minutes
      
      // Create order date (last 7 days)
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 7));
      
      let assignedPartner = null;
      let dispatchTime = null;
      let estimatedDeliveryTime = null;
      
      // Assign delivery partner for non-PREP orders
      if (status !== OrderStatus.PREP && deliveryPartners.length > 0) {
        const randomPartner = deliveryPartners[Math.floor(Math.random() * deliveryPartners.length)];
        assignedPartner = randomPartner.userId._id;
        
        // Set dispatch time
        dispatchTime = new Date(createdAt.getTime() + prepTime * 60000);
        
        // Set estimated delivery time
        estimatedDeliveryTime = new Date(dispatchTime.getTime() + randomPartner.averageDeliveryTime * 60000);
      }
      
      const trackingUpdates = generateTrackingUpdates(status, createdAt);
      
      ordersToCreate.push({
        orderId: generateOrderId(i), // Manually generate orderId
        items,
        prepTime,
        status,
        assignedPartner,
        dispatchTime,
        estimatedDeliveryTime,
        createdBy: randomManager._id,
        trackingUpdates,
        createdAt,
        updatedAt: createdAt
      });
    }
    
    // Create orders one by one to avoid bulk insert issues
    const orders: any[] = [];
    for (const orderData of ordersToCreate) {
      try {
        const order = await Order.create(orderData);
        orders.push(order);
      } catch (error) {
        console.error(`❌ Error creating order ${orderData.orderId}:`, error);
        // Continue with other orders
      }
    }
    
    console.log(`✅ Created ${orders.length} orders`);
    
    // Update delivery partners' current orders
    for (const order of orders) {
      if (order.assignedPartner && (order.status === OrderStatus.PICKED || order.status === OrderStatus.ON_ROUTE)) {
        await DeliveryPartner.findOneAndUpdate(
          { userId: order.assignedPartner },
          { $push: { currentOrders: order._id } }
        );
      }
    }
    
    // Log order statistics
    const statusCounts = orderStatuses.reduce((acc, status) => {
      acc[status] = orders.filter(order => order.status === status).length;
      return acc;
    }, {} as Record<OrderStatus, number>);
    
    console.log('📊 Order statistics:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   - ${status}: ${count} orders`);
    });
    
    const assignedOrders = orders.filter(order => order.assignedPartner).length;
    console.log(`   - ${assignedOrders} orders assigned to delivery partners`);
    
  } catch (error) {
    console.error('❌ Error seeding orders:', error);
    throw error;
  }
};

export default seedOrders; 