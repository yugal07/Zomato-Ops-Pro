# Zomato Ops Pro - Delivery Management System

A comprehensive delivery management system built with React, TypeScript, Node.js, Express, and MongoDB. Features real-time order tracking, role-based access control, and analytics dashboard.

## 🚀 Features

- **Role-based Authentication** (Manager & Delivery Partner)
- **Real-time Order Tracking** with Socket.io
- **Interactive Dashboard** with analytics
- **Order Management** with status updates
- **Delivery Partner Assignment**
- **Real-time Notifications**
- **Responsive Design** with Tailwind CSS
- **Dark/Light Theme Support**

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/)
- **npm** or **yarn** package manager

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

# Or clear existing data and seed fresh
npm run seed:clear
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
| Email | Password | Role |
|-------|----------|------|
| admin@zomato.com | admin123 | Manager |
| manager1@zomato.com | password123 | Manager |
| manager2@zomato.com | password123 | Manager |

### Delivery Partner Accounts
| Email | Password | Role |
|-------|----------|------|
| delivery1@zomato.com | password123 | Delivery Partner |
| delivery2@zomato.com | password123 | Delivery Partner |
| delivery3@zomato.com | password123 | Delivery Partner |

## 🏗️ Project Structure

```
Zomato/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   ├── package.json
│   └── tailwind.config.js
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## 🔧 Available Scripts

### Backend (server/)
```bash
npm run dev          # Start development server with auto-reload
npm run build        # Build TypeScript to JavaScript
npm start            # Start production server
npm run seed         # Seed database with sample data
npm run seed:clear   # Clear and reseed database
npm test             # Run tests
```

### Frontend (client/)
```bash
npm start            # Start development server
npm run build        # Build for production
npm test             # Run tests
npm run eject        # Eject from Create React App
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - User logout

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order (Manager only)
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/status` - Update order status
- `PUT /api/orders/:id/assign` - Assign delivery partner (Manager only)

### Delivery
- `GET /api/delivery/partners` - Get available partners (Manager only)
- `PUT /api/delivery/availability` - Toggle availability (Delivery only)
- `PUT /api/delivery/location` - Update location (Delivery only)
- `GET /api/delivery/my-orders` - Get assigned orders (Delivery only)
- `GET /api/delivery/profile` - Get delivery profile (Delivery only)

### Analytics
- `GET /api/analytics/orders` - Order metrics (Manager only)
- `GET /api/analytics/delivery` - Delivery metrics (Manager only)
- `GET /api/analytics/system` - System metrics (Manager only)
- `GET /api/analytics/connected-users` - Connected users (Manager only)

### Tracking
- `GET /api/tracking/:orderId` - Get order tracking
- `POST /api/tracking/:orderId/subscribe` - Subscribe to tracking updates

## 🔌 Real-time Features

The application uses Socket.io for real-time features:

- **Order Status Updates** - Real-time order status changes
- **Location Tracking** - Live delivery partner location updates
- **Notifications** - Instant notifications for order updates
- **Connected Users** - Real-time user connection status

## 🎨 UI Features

- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark/Light Theme** - Toggle between themes
- **Modern UI** - Built with Tailwind CSS and Lucide React icons
- **Loading States** - Smooth loading indicators
- **Error Handling** - User-friendly error messages
- **Form Validation** - Client and server-side validation

## 🚀 Deployment

### Backend Deployment
1. Set environment variables on your hosting platform
2. Build the application: `npm run build`
3. Start the server: `npm start`

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the `build` folder to your hosting platform

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
CLIENT_URL=your_production_frontend_url
PORT=5000
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check the `MONGODB_URI` in your `.env` file

2. **Port Already in Use**
   - Change the port in `.env` file
   - Kill the process using the port: `lsof -ti:5000 | xargs kill -9`

3. **CORS Errors**
   - Ensure `CLIENT_URL` in `.env` matches your frontend URL
   - Check that both servers are running

4. **Authentication Issues**
   - Clear browser localStorage
   - Check JWT_SECRET in `.env` file

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📞 Support

For support and questions, please open an issue in the repository.