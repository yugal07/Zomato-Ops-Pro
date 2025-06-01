# Zomato Ops Pro - Delivery Management System

A comprehensive delivery management system built with React, TypeScript, Node.js, Express, and MongoDB. Features real-time order tracking, role-based access control, analytics dashboard, and advanced delivery partner management.

## 🚀 Features

### Core Features
- **Role-based Authentication** (Manager & Delivery Partner)
- **Real-time Order Tracking** with Socket.io
- **Interactive Dashboard** with analytics and metrics
- **Order Management** with complete lifecycle tracking
- **Delivery Partner Assignment** and management
- **Real-time Notifications** and status updates
- **Advanced Analytics** with performance insights
- **Mock Order Generator** for testing and demonstration

### UI/UX Features
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Theme Support** with persistent preferences
- **Modern UI** - Built with Tailwind CSS and Lucide React icons
- **Loading States** - Smooth loading indicators and skeleton screens
- **Error Handling** - User-friendly error messages and validation
- **Form Validation** - Client and server-side validation with real-time feedback
- **Profile Management** - Complete user profile editing capabilities

### Advanced Features
- **Performance Metrics** - Detailed delivery partner performance tracking
- **Order History** - Comprehensive order history with filtering
- **Status Management** - Complete order status lifecycle management
- **Partner Assignment** - Intelligent delivery partner assignment system
- **System Analytics** - Real-time system health and user connection monitoring

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
  - Current tested version: v22.12.0
- **npm** (v8 or higher) - Comes with Node.js
  - Current tested version: v10.9.0
- **MongoDB** (v4.4 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yugal07/Zomato-Ops-Pro
cd Zomato
```

### 2. Backend Setup

#### Navigate to server directory
```bash
cd server
```

#### Install dependencies
```bash
npm install
```

#### Create environment file
Create a `.env` file in the `server` directory:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/zomato_delivery

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_secure
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CLIENT_URL=http://localhost:3000
```

#### Seed the database (Optional but recommended)
```bash
# Seed all data (users, delivery partners, orders)
npm run seed

# Or use specific seeders
npm run seed:users      # Seed only users
npm run seed:partners   # Seed only delivery partners
npm run seed:orders     # Seed only orders

# Clear existing data and seed fresh
npm run seed:clear

# Get help with seeder options
npm run seed:help
```

#### Start the backend server
```bash
# Development mode with auto-reload
npm run dev

# Or build and start production
npm run build
npm start
```

The backend server will start on `http://localhost:5000`

### 3. Frontend Setup

#### Navigate to client directory (in a new terminal)
```bash
cd client
```

#### Install dependencies
```bash
npm install
```

#### Start the frontend development server
```bash
npm start
```

The frontend application will start on `http://localhost:3000`

## 🔐 Default Login Credentials

After seeding the database, you can use these accounts:

### Manager Accounts
| Email | Password | Role | Access Level |
|-------|----------|------|--------------|
| admin@zomato.com | admin123 | Manager | Full Admin Access |
| manager@demo.com | password123 | Manager | Standard Manager |
| manager2@zomato.com | password123 | Manager | Standard Manager |

### Delivery Partner Accounts
| Email | Password | Role | Status |
|-------|----------|------|--------|
| delivery@demo.com | password123 | Delivery Partner | Active |
| delivery2@zomato.com | password123 | Delivery Partner | Active |
| delivery3@zomato.com | password123 | Delivery Partner | Active |

## 🏗️ Project Structure

```
Zomato/
├── client/                          # React frontend application
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── components/              # React components
│   │   │   ├── auth/               # Authentication components
│   │   │   ├── common/             # Shared components
│   │   │   │   ├── Header.tsx      # Navigation header
│   │   │   │   ├── Profile.tsx     # User profile management
│   │   │   │   ├── ThemeToggle.tsx # Dark/light theme switcher
│   │   │   │   └── LoadingSpinner.tsx # Loading states
│   │   │   ├── delivery/           # Delivery partner components
│   │   │   │   ├── DeliveryDashboard.tsx # Main delivery dashboard
│   │   │   │   ├── DeliveryOrders.tsx    # Order management
│   │   │   │   ├── DeliveryHistory.tsx   # Order history
│   │   │   │   ├── PerformanceMetrics.tsx # Performance analytics
│   │   │   │   └── OrderStatusUpdate.tsx # Status management
│   │   │   ├── manager/            # Manager components
│   │   │   │   ├── ManagerDashboard.tsx     # Main manager dashboard
│   │   │   │   ├── OrderTable.tsx          # Order management table
│   │   │   │   ├── CreateOrderForm.tsx     # Order creation
│   │   │   │   ├── AnalyticsDashboard.tsx  # Analytics and metrics
│   │   │   │   ├── PartnerAssignment.tsx   # Partner management
│   │   │   │   ├── MockOrderGenerator.tsx  # Testing utilities
│   │   │   │   └── OrderDetailsModal.tsx   # Order details view
│   │   │   └── tracker/            # Order tracking components
│   │   ├── context/                # React contexts for state management
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── services/               # API service layer
│   │   ├── types/                  # TypeScript type definitions
│   │   ├── utils/                  # Utility functions
│   │   └── config/                 # Configuration files
│   ├── package.json                # Frontend dependencies
│   └── tailwind.config.js          # Tailwind CSS configuration
├── server/                         # Node.js backend application
│   ├── src/
│   │   ├── controllers/            # Route controllers
│   │   ├── middleware/             # Express middleware
│   │   ├── models/                 # MongoDB models
│   │   ├── routes/                 # API routes
│   │   ├── services/               # Business logic services
│   │   ├── types/                  # TypeScript type definitions
│   │   ├── utils/                  # Utility functions
│   │   ├── config/                 # Configuration files
│   │   ├── scripts/                # Database seeding scripts
│   │   └── seeders/                # Data seeding utilities
│   ├── package.json                # Backend dependencies
│   └── tsconfig.json               # TypeScript configuration
├── README.md                       # Project documentation
├── API_DOCUMENTATION_GUIDE.md      # API documentation
└── Zomato_API_Collection.postman_collection.json # Postman collection
```

## 🔧 Available Scripts

### Backend (server/)
```bash
npm run dev          # Start development server with auto-reload
npm run build        # Build TypeScript to JavaScript
npm start            # Start production server
npm run seed         # Seed database with all sample data
npm run seed:clear   # Clear and reseed database
npm run seed:users   # Seed only user accounts
npm run seed:partners # Seed only delivery partners
npm run seed:orders  # Seed only orders
npm run seed:help    # Show seeder help and options
```

### Frontend (client/)
```bash
npm start            # Start development server
npm run build        # Build for production
npm run eject        # Eject from Create React App
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - User logout

### Orders
- `GET /api/orders` - Get all orders (with filtering and pagination)
- `POST /api/orders` - Create new order (Manager only)
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/status` - Update order status
- `PUT /api/orders/:id/assign` - Assign delivery partner (Manager only)
- `DELETE /api/orders/:id` - Cancel order (Manager only)

### Delivery
- `GET /api/delivery/partners` - Get available partners (Manager only)
- `PUT /api/delivery/availability` - Toggle availability (Delivery only)
- `PUT /api/delivery/location` - Update location (Delivery only)
- `GET /api/delivery/my-orders` - Get assigned orders (Delivery only)
- `GET /api/delivery/profile` - Get delivery profile (Delivery only)
- `GET /api/delivery/history` - Get delivery history (Delivery only)
- `PUT /api/delivery/profile` - Update delivery profile (Delivery only)

### Analytics
- `GET /api/analytics/orders` - Order metrics and trends (Manager only)
- `GET /api/analytics/delivery` - Delivery performance metrics (Manager only)
- `GET /api/analytics/system` - System health metrics (Manager only)
- `GET /api/analytics/connected-users` - Real-time connected users (Manager only)

### Tracking
- `GET /api/tracking/:orderId` - Get order tracking information
- `POST /api/tracking/:orderId/subscribe` - Subscribe to tracking updates

## 🔌 Real-time Features

The application uses Socket.io for real-time features:

### Socket Events
- **Order Status Updates** - Real-time order status changes
- **Location Tracking** - Live delivery partner location updates
- **Connected Users** - Real-time user connection status
- **Assignment Updates** - Real-time delivery partner assignments
- **System Alerts** - Real-time system notifications


### Design System
- **Dark/Light Theme** - System preference detection with manual toggle
- **Modern UI Components** - Built with Tailwind CSS and Lucide React icons
- **Consistent Typography** - Hierarchical text styling throughout
- **Color Palette** - Carefully chosen colors for accessibility

### User Experience
- **Loading States** - Skeleton screens and smooth loading indicators
- **Error Handling** - Contextual error messages with recovery suggestions
- **Form Validation** - Real-time validation with helpful error messages
- **Navigation** - Intuitive navigation with breadcrumbs and active states
- **Accessibility** - WCAG compliant with keyboard navigation support

### Interactive Elements
- **Hover Effects** - Subtle animations and state changes
- **Click Feedback** - Visual feedback for all interactive elements
- **Smooth Transitions** - CSS transitions for state changes
- **Modal Dialogs** - Accessible modal implementations
- **Toast Notifications** - Non-intrusive notification system

## 🚀 Deployment

### Backend Deployment

#### Environment Setup
```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret_minimum_32_characters
CLIENT_URL=your_production_frontend_url
PORT=5000
```

#### Build and Deploy
```bash
# Build the application
npm run build

# Start production server
npm start
```

### Frontend Deployment

#### Build for Production
```bash
# Create optimized production build
npm run build

# The build folder contains the static files ready for deployment
```

#### Deployment Options
- **Netlify**: Drag and drop the `build` folder
- **Vercel**: Connect your GitHub repository
- **AWS S3**: Upload build files to S3 bucket
- **Traditional Hosting**: Upload build files to web server

### Docker Deployment (Optional)

Create `Dockerfile` for containerized deployment:

```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## 🧪 Testing

### API Testing
- **Postman Collection**: Import `Zomato_API_Collection.postman_collection.json`
- **Automated Tests**: Run `npm test` in server directory
- **Manual Testing**: Use the mock order generator for realistic data
- **Unit Tests**: Run `npm test` in client directory
- **Integration Tests**: Test component interactions
- **E2E Testing**: Test complete user workflows

### Mock Data Generation
Use the built-in mock order generator to create realistic test data:
- Access via Manager Dashboard → Mock Order Generator
- Generate orders with realistic customer data
- Test various order statuses and scenarios

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   ```bash
   # Check if MongoDB is running
   sudo systemctl status mongod
   
   # Start MongoDB if not running
   sudo systemctl start mongod
   
   # Check connection string in .env file
   MONGODB_URI=mongodb://localhost:27017/zomato_delivery
   ```

2. **Port Already in Use**
   ```bash
   # Find process using the port
   lsof -ti:5000
   
   # Kill the process
   lsof -ti:5000 | xargs kill -9
   
   # Or change port in .env file
   PORT=5001
   ```

3. **CORS Errors**
   ```bash
   # Ensure CLIENT_URL matches your frontend URL
   CLIENT_URL=http://localhost:3000
   
   # Check that both servers are running
   # Backend: http://localhost:5000
   # Frontend: http://localhost:3000
   ```

4. **Authentication Issues**
   ```bash
   # Clear browser localStorage
   localStorage.clear()
   
   # Check JWT_SECRET in .env file (minimum 32 characters)
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_secure
   
   # Verify token expiration
   JWT_EXPIRES_IN=7d
   ```

5. **Socket.io Connection Issues**
   ```bash
   # Check if backend server is running
   curl http://localhost:5000/api/health
   
   # Verify CORS configuration
   # Check browser console for connection errors
   ```

6. **Build Errors**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   
   # Clear TypeScript cache
   npx tsc --build --clean
   ```

## 📚 Additional Documentation

- **API Documentation**: See `API_DOCUMENTATION_GUIDE.md` for detailed API documentation
- **Postman Collection**: Import `Zomato_API_Collection.postman_collection.json` for API testing
- **Seeder Documentation**: See `server/SEEDER_SETUP.md` for database seeding details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes with proper commit messages
4. Add tests for new functionality
5. Ensure all tests pass: `npm test`
6. Update documentation if needed
7. Commit your changes: `git commit -m 'Add feature: description'`
8. Push to the branch: `git push origin feature-name`
9. Submit a pull request with detailed description

### Development Guidelines
- Follow TypeScript best practices
- Use meaningful variable and function names
- Add comments for complex logic
- Maintain consistent code formatting
- Write tests for new features
- Update documentation for API changes

## 📞 Support

For support and questions:
- **Issues**: Open an issue in the GitHub repository
- **Documentation**: Check the API documentation guide
- **Community**: Join discussions in the repository

---

**Built with ❤️ using React, TypeScript, Node.js, Express, MongoDB, and Socket.io**