import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import connectDB from './config/database';
import { corsOptions } from './config/auth';
import { errorHandler, notFound } from './middleware/errorHandler';
import { initializeSocketService } from './services/socketService';

// Import routes
import authRoutes from './routes/auth';
import orderRoutes from './routes/orders';
import deliveryRoutes from './routes/delivery';
import analyticsRoutes from './routes/analytics';
import trackingRoutes from './routes/tracking';

// Load environment variables
dotenv.config();

const app = express();

// Create HTTP server
const server = createServer(app);

// Initialize Socket.io
const socketService = initializeSocketService(server);

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Make socket service available in routes
app.use((req, res, next) => {
  (req as any).socketService = socketService;
  next();
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    connectedUsers: socketService.getConnectedUsers().length,
    socketEnabled: true
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/tracking', trackingRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`Socket.io server initialized`);
  console.log(`Real-time features enabled`);
});

export default app;