import { Router } from 'express';
import { DeliveryController } from '../controllers/deliveryController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { UserRole } from '../types/auth.types';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Manager can view available partners
router.get('/partners', authorizeRoles(UserRole.MANAGER), DeliveryController.getAvailablePartners);

// Delivery partner routes
router.put('/availability', authorizeRoles(UserRole.DELIVERY), DeliveryController.toggleAvailability);
router.put('/location', authorizeRoles(UserRole.DELIVERY), DeliveryController.updateLocation);
router.get('/my-orders', authorizeRoles(UserRole.DELIVERY), DeliveryController.getMyOrders);
router.get('/profile', authorizeRoles(UserRole.DELIVERY), DeliveryController.getProfile);

export default router;