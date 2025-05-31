import DeliveryPartner from '../models/DeliveryPartner';
import User from '../models/User';
import { UserRole } from '../types/auth.types';

// Mumbai coordinates for realistic delivery locations
const mumbaiLocations = [
  { lat: 19.0760, lng: 72.8777, area: 'Mumbai Central' },
  { lat: 19.0596, lng: 72.8295, area: 'Colaba' },
  { lat: 19.0330, lng: 72.8697, area: 'Worli' },
  { lat: 19.1136, lng: 72.8697, area: 'Bandra' },
  { lat: 19.0544, lng: 72.8324, area: 'Fort' },
  { lat: 19.0176, lng: 72.8562, area: 'Lower Parel' },
  { lat: 19.1075, lng: 72.8263, area: 'Juhu' },
  { lat: 19.0896, lng: 72.8656, area: 'Andheri' },
  { lat: 19.1197, lng: 72.9089, area: 'Powai' },
  { lat: 19.0728, lng: 72.8826, area: 'Dadar' }
];

export const seedDeliveryPartners = async (): Promise<void> => {
  try {
    console.log('🌱 Seeding delivery partners...');
    
    // Clear existing delivery partners
    await DeliveryPartner.deleteMany({});
    console.log('✅ Cleared existing delivery partners');
    
    // Get all delivery users
    const deliveryUsers = await User.find({ role: UserRole.DELIVERY });
    
    if (deliveryUsers.length === 0) {
      console.log('⚠️  No delivery users found. Please seed users first.');
      return;
    }
    
    const deliveryPartnerData = deliveryUsers.map((user, index) => {
      const location = mumbaiLocations[index % mumbaiLocations.length];
      
      return {
        userId: user._id,
        isAvailable: user.isActive && Math.random() > 0.3, // 70% chance of being available if active
        currentOrders: [], // Start with no orders
        location: {
          lat: location.lat + (Math.random() - 0.5) * 0.01, // Add small random offset
          lng: location.lng + (Math.random() - 0.5) * 0.01
        },
        averageDeliveryTime: Math.floor(Math.random() * 20) + 20 // 20-40 minutes
      };
    });
    
    const deliveryPartners = await DeliveryPartner.create(deliveryPartnerData);
    console.log(`✅ Created ${deliveryPartners.length} delivery partners`);
    
    // Log availability stats
    const availablePartners = deliveryPartners.filter(partner => partner.isAvailable);
    console.log(`   - ${availablePartners.length} available partners`);
    console.log(`   - ${deliveryPartners.length - availablePartners.length} unavailable partners`);
    
  } catch (error) {
    console.error('❌ Error seeding delivery partners:', error);
    throw error;
  }
};

export default seedDeliveryPartners; 