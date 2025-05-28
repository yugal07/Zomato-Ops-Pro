import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { UserRole } from '../types/auth.types';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Manager-only analytics routes
router.get('/orders', authorizeRoles(UserRole.MANAGER), AnalyticsController.getOrderMetrics);
router.get('/delivery', authorizeRoles(UserRole.MANAGER), AnalyticsController.getDeliveryMetrics);
router.get('/system', authorizeRoles(UserRole.MANAGER), AnalyticsController.getSystemMetrics);
router.get('/connected-users', authorizeRoles(UserRole.MANAGER), AnalyticsController.getConnectedUsers);

export default router;