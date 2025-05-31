import User from '../models/User';
import { UserRole } from '../types/auth.types';

export const userSeedData = [
  // Manager Users
  {
    email: 'manager@demo.com',
    password: 'password123',
    name: 'John Manager',
    role: UserRole.MANAGER,
    isActive: true
  },
  {
    email: 'manager2@zomato.com',
    password: 'password123',
    name: 'Sarah Wilson',
    role: UserRole.MANAGER,
    isActive: true
  },
  {
    email: 'admin@zomato.com',
    password: 'admin123',
    name: 'Admin User',
    role: UserRole.MANAGER,
    isActive: true
  },
  
  // Delivery Partners
  {
    email: 'delivery@demo.com',
    password: 'password123',
    name: 'Raj Kumar',
    role: UserRole.DELIVERY,
    isActive: true
  },
  {
    email: 'delivery2@zomato.com',
    password: 'password123',
    name: 'Priya Sharma',
    role: UserRole.DELIVERY,
    isActive: true
  },
  {
    email: 'delivery3@zomato.com',
    password: 'password123',
    name: 'Mohammed Ali',
    role: UserRole.DELIVERY,
    isActive: true
  },
  {
    email: 'delivery4@zomato.com',
    password: 'password123',
    name: 'Anita Singh',
    role: UserRole.DELIVERY,
    isActive: true
  },
  {
    email: 'delivery5@zomato.com',
    password: 'password123',
    name: 'Vikram Patel',
    role: UserRole.DELIVERY,
    isActive: true
  },
  {
    email: 'delivery6@zomato.com',
    password: 'password123',
    name: 'Deepika Reddy',
    role: UserRole.DELIVERY,
    isActive: false // Inactive delivery partner
  },
  {
    email: 'delivery7@zomato.com',
    password: 'password123',
    name: 'Arjun Gupta',
    role: UserRole.DELIVERY,
    isActive: true
  }
];

export const seedUsers = async (): Promise<void> => {
  try {
    console.log('🌱 Seeding users...');
    
    // Clear existing users
    await User.deleteMany({});
    console.log('✅ Cleared existing users');
    
    // Create users
    const users = await User.create(userSeedData);
    console.log(`✅ Created ${users.length} users`);
    
    // Log created users by role
    const managers = users.filter(user => user.role === UserRole.MANAGER);
    const deliveryPartners = users.filter(user => user.role === UserRole.DELIVERY);
    
    console.log(`   - ${managers.length} managers`);
    console.log(`   - ${deliveryPartners.length} delivery partners`);
    
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
};

export default seedUsers; 