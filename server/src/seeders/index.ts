import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/database';
import seedUsers from './userSeeder';
import seedDeliveryPartners from './deliveryPartnerSeeder';
import seedOrders from './orderSeeder';

// Load environment variables
dotenv.config();

interface SeedOptions {
  users?: boolean;
  deliveryPartners?: boolean;
  orders?: boolean;
  all?: boolean;
  clear?: boolean;
}

class DatabaseSeeder {
  private async clearAllData(): Promise<void> {
    try {
      console.log('🗑️  Clearing all data...');
      
      // Import models to ensure they're registered
      const User = (await import('../models/User')).default;
      const DeliveryPartner = (await import('../models/DeliveryPartner')).default;
      const Order = (await import('../models/Order')).default;
      
      await Promise.all([
        User.deleteMany({}),
        DeliveryPartner.deleteMany({}),
        Order.deleteMany({})
      ]);
      
      console.log('✅ All data cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing data:', error);
      throw error;
    }
  }

  async seed(options: SeedOptions = { all: true }): Promise<void> {
    try {
      console.log('🚀 Starting database seeding...');
      console.log('📅 Timestamp:', new Date().toISOString());
      console.log('🔧 Options:', options);
      
      // Connect to database
      await connectDB();
      console.log('✅ Database connected');
      
      // Clear all data if requested
      if (options.clear) {
        await this.clearAllData();
      }
      
      // Seed users first (required for other collections)
      if (options.all || options.users) {
        await seedUsers();
      }
      
      // Seed delivery partners (depends on users)
      if (options.all || options.deliveryPartners) {
        await seedDeliveryPartners();
      }
      
      // Seed orders (depends on users and delivery partners)
      if (options.all || options.orders) {
        await seedOrders();
      }
      
      console.log('🎉 Database seeding completed successfully!');
      
      // Print summary
      await this.printSummary();
      
    } catch (error) {
      console.error('💥 Seeding failed:', error);
      throw error;
    }
  }

  private async printSummary(): Promise<void> {
    try {
      const User = (await import('../models/User')).default;
      const DeliveryPartner = (await import('../models/DeliveryPartner')).default;
      const Order = (await import('../models/Order')).default;
      
      const [userCount, partnerCount, orderCount] = await Promise.all([
        User.countDocuments(),
        DeliveryPartner.countDocuments(),
        Order.countDocuments()
      ]);
      
      console.log('\n📊 DATABASE SUMMARY:');
      console.log('═'.repeat(50));
      console.log(`👥 Users: ${userCount}`);
      console.log(`🚚 Delivery Partners: ${partnerCount}`);
      console.log(`📦 Orders: ${orderCount}`);
      console.log('═'.repeat(50));
      
      // Additional stats
      const managers = await User.countDocuments({ role: 'manager' });
      const deliveryUsers = await User.countDocuments({ role: 'delivery' });
      const availablePartners = await DeliveryPartner.countDocuments({ isAvailable: true });
      const activeOrders = await Order.countDocuments({ 
        status: { $in: ['PREP', 'PICKED', 'ON_ROUTE'] } 
      });
      
      console.log(`📋 Managers: ${managers}`);
      console.log(`🏍️  Delivery Users: ${deliveryUsers}`);
      console.log(`✅ Available Partners: ${availablePartners}`);
      console.log(`🔄 Active Orders: ${activeOrders}`);
      console.log('═'.repeat(50));
      
    } catch (error) {
      console.error('❌ Error generating summary:', error);
    }
  }

  async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
      console.log('👋 Database disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting:', error);
    }
  }
}

// CLI interface
const runSeeder = async (): Promise<void> => {
  const seeder = new DatabaseSeeder();
  
  try {
    const args = process.argv.slice(2);
    const options: SeedOptions = {};
    
    // Parse command line arguments
    if (args.includes('--users')) options.users = true;
    if (args.includes('--partners')) options.deliveryPartners = true;
    if (args.includes('--orders')) options.orders = true;
    if (args.includes('--clear')) options.clear = true;
    if (args.includes('--all') || Object.keys(options).length === 0) {
      options.all = true;
    }
    
    await seeder.seed(options);
    
  } catch (error) {
    console.error('💥 Seeder execution failed:', error);
    process.exit(1);
  } finally {
    await seeder.disconnect();
    process.exit(0);
  }
};

// Export for programmatic use
export { DatabaseSeeder };
export default runSeeder;

// Run if called directly
if (require.main === module) {
  runSeeder();
} 