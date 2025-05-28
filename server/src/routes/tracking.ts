import { Router } from 'express';
import { TrackingController } from '../controllers/trackingController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/:orderId', TrackingController.getOrderTracking);
router.post('/:orderId/subscribe', TrackingController.subscribeToTracking);

export default router;