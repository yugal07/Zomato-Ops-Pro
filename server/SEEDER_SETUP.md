# 🚀 Seeder Setup Guide

This guide will help you set up and run the database seeder for your Zomato delivery application.

## 📋 Prerequisites

1. **Node.js** (v14 or higher)
2. **MongoDB** (running locally or remote connection)
3. **TypeScript** and **ts-node** (installed via npm)

## 🔧 Environment Setup

### 1. Create Environment File

Create a `.env` file in the `server` directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/zomato_delivery

# JWT Configuration (required for user creation)
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CLIENT_URL=http://localhost:3000
```

### 2. Install Dependencies

Make sure all dependencies are installed:

```bash
cd server
npm install
```

## 🌱 Running the Seeder

### Quick Start (Recommended)
```bash
# Seed all data (users, delivery partners, orders)
npm run seed

# Clear existing data and seed fresh
npm run seed:clear
```

### Selective Seeding
```bash
# Seed only users
npm run seed:users

# Seed only delivery partners (requires users)
npm run seed:partners

# Seed only orders (requires users and delivery partners)
npm run seed:orders
```

### Get Help
```bash
npm run seed:help
```

## 📊 What Gets Created

### 👥 Users (10 total)
- **3 Managers** for admin/management access
- **7 Delivery Partners** for delivery operations

### 🚚 Delivery Partners (7 total)
- Linked to delivery users
- Distributed across Mumbai locations
- Random availability status
- Realistic delivery times (20-40 minutes)

### 📦 Orders (50 total)
- Created over the last 7 days
- Random status distribution
- Authentic Indian food items
- Complete tracking history
- Realistic pricing in INR

## 🔐 Login Credentials

After seeding, you can use these accounts to test the application:

### Manager Accounts
| Email | Password | Name |
|-------|----------|------|
| admin@zomato.com | admin123 | Admin User |
| manager1@zomato.com | password123 | John Manager |
| manager2@zomato.com | password123 | Sarah Wilson |

### Delivery Partner Accounts
| Email | Password | Name |
|-------|----------|------|
| delivery1@zomato.com | password123 | Raj Kumar |
| delivery2@zomato.com | password123 | Priya Sharma |
| delivery3@zomato.com | password123 | Mohammed Ali |
| delivery4@zomato.com | password123 | Anita Singh |
| delivery5@zomato.com | password123 | Vikram Patel |
| delivery6@zomato.com | password123 | Deepika Reddy |
| delivery7@zomato.com | password123 | Arjun Gupta |

## 🔍 Verification

### Check Database Contents
After seeding, you can verify the data was created:

```bash
# Using MongoDB shell
mongosh zomato_delivery

# Check collections
db.users.countDocuments()
db.deliverypartners.countDocuments()
db.orders.countDocuments()

# Sample queries
db.users.find({ role: 'manager' })
db.orders.find({ status: 'DELIVERED' }).limit(5)
```

### Application Testing
1. Start your server: `npm run dev`
2. Open your client application
3. Login with any of the provided credentials
4. Verify that data appears correctly in the UI

## 🛠️ Customization

### Modify Seed Data

1. **Users**: Edit `src/seeders/userSeeder.ts`
2. **Locations**: Edit `src/seeders/deliveryPartnerSeeder.ts`
3. **Food Items**: Edit `src/seeders/orderSeeder.ts`

### Add More Data

To create more orders or users, modify the respective seeder files:

```typescript
// In orderSeeder.ts - change this line:
for (let i = 0; i < 50; i++) {  // Change 50 to desired number
```

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   ```
   Error: MONGODB_URI is not defined
   ```
   **Solution**: Ensure `.env` file exists with correct `MONGODB_URI`

2. **Permission Errors**
   ```
   MongoServerError: not authorized
   ```
   **Solution**: Check MongoDB authentication credentials

3. **TypeScript Errors**
   ```
   Cannot find module 'ts-node'
   ```
   **Solution**: Install ts-node globally or ensure it's in devDependencies

4. **Dependency Issues**
   ```
   ⚠️ No delivery users found
   ```
   **Solution**: Run `npm run seed:users` first, then other seeders

### Reset Everything
If you encounter issues, you can completely reset:

```bash
# Clear all data and reseed
npm run seed:clear

# Or manually clear database
mongosh zomato_delivery --eval "db.dropDatabase()"
npm run seed
```

## 📈 Performance Notes

- Seeding 50 orders typically takes 2-5 seconds
- All passwords are properly hashed (may take additional time)
- Geographic coordinates are realistic Mumbai locations
- Order timestamps span the last 7 days for realistic data distribution

## 🔄 Integration with Development

### Auto-seeding (Optional)
You can modify your server startup to auto-seed in development:

```typescript
// In server.ts
if (process.env.NODE_ENV === 'development' && process.env.AUTO_SEED === 'true') {
  import('./seeders/index').then(({ DatabaseSeeder }) => {
    const seeder = new DatabaseSeeder();
    seeder.seed({ all: true });
  });
}
```

### CI/CD Integration
For testing environments, you can add seeding to your CI pipeline:

```yaml
# In your CI config
- name: Seed test data
  run: npm run seed:clear
```

## 📞 Support

If you encounter issues with the seeder:

1. Check the console output for detailed error messages
2. Verify your MongoDB connection
3. Ensure all environment variables are set
4. Check the seeder logs for specific collection failures

The seeder provides detailed logging to help diagnose issues quickly.