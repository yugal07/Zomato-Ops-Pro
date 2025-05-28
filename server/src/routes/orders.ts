import { Router } from 'express';
import { OrderController } from '../controllers/orderController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { UserRole } from '../types/auth.types';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Manager-only routes
router.post('/', authorizeRoles(UserRole.MANAGER), OrderController.createOrder);
router.put('/:id/assign', authorizeRoles(UserRole.MANAGER), OrderController.assignPartner);

// Routes accessible by both roles
router.get('/', OrderController.getOrders);
router.get('/:id', OrderController.getOrderById);

// Status updates (both managers and delivery partners can update)
router.put('/:id/status', OrderController.updateStatus);

export default router;