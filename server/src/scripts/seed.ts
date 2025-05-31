#!/usr/bin/env ts-node

import runSeeder from '../seeders/index';

// Enhanced CLI with help text
const showHelp = (): void => {
  console.log(`
🌱 Zomato Database Seeder
========================

Usage: npm run seed [options]

Options:
  --all        Seed all collections (default)
  --users      Seed only users
  --partners   Seed only delivery partners
  --orders     Seed only orders
  --clear      Clear all data before seeding
  --help       Show this help message

Examples:
  npm run seed                    # Seed all data
  npm run seed --clear            # Clear and seed all data
  npm run seed --users --partners # Seed only users and delivery partners
  npm run seed --orders           # Seed only orders

Note: Dependencies are automatically handled:
- Delivery partners require users to exist
- Orders require both users and delivery partners to exist
`);
};

// Check for help flag
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp();
  process.exit(0);
}

// Run the seeder
runSeeder().catch((error) => {
  console.error('💥 Seeder failed:', error);
  process.exit(1);
}); 