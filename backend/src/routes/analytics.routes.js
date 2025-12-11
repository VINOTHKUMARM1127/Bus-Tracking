import { Router } from 'express';
import { authenticate, requireRole, ROLE } from '../middleware/auth.js';
import {
  getTripsPerDay,
  getAverageTripDuration,
  getTopOverspeedDrivers,
  getDashboardStats
} from '../controllers/analyticsController.js';

const router = Router();

router.use(authenticate, requireRole(ROLE.admin));

router.get('/trips-per-day', getTripsPerDay);
router.get('/avg-trip-duration', getAverageTripDuration);
router.get('/top-overspeed-drivers', getTopOverspeedDrivers);
router.get('/dashboard-stats', getDashboardStats);

export default router;

