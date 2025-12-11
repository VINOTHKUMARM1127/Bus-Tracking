import { Router } from 'express';
import { authenticate, requireRole, ROLE } from '../middleware/auth.js';
import {
  getAlerts,
  acknowledgeAlert,
  getUnacknowledgedCount
} from '../controllers/alertController.js';

const router = Router();

router.use(authenticate, requireRole(ROLE.admin));

router.get('/', getAlerts);
router.get('/unacknowledged/count', getUnacknowledgedCount);
router.post('/:id/acknowledge', acknowledgeAlert);

export default router;

