import { Router } from 'express';
import { authenticate, requireRole, ROLE } from '../middleware/auth.js';
import {
  createRoute,
  getRoutes,
  getRoute,
  updateRoute,
  deleteRoute,
  assignDriverToRoute
} from '../controllers/routeController.js';

const router = Router();

router.use(authenticate, requireRole(ROLE.admin));

router.post('/', createRoute);
router.get('/', getRoutes);
router.get('/:id', getRoute);
router.put('/:id', updateRoute);
router.delete('/:id', deleteRoute);
router.post('/:id/assign-driver', assignDriverToRoute);

export default router;

