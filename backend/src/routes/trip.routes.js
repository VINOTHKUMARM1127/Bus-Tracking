import { Router } from 'express';
import { authenticate, requireRole, ROLE } from '../middleware/auth.js';
import { Trip } from '../models/Trip.js';
import {
  startTrip,
  endTrip,
  getTrips,
  getTrip,
  getTripLocations
} from '../controllers/tripController.js';

const router = Router();

// Driver routes
const driverRouter = Router();
driverRouter.use(authenticate, requireRole(ROLE.driver));
driverRouter.post('/start', startTrip);
driverRouter.post('/:id/end', endTrip);
// Get driver's own trips
driverRouter.get('/my-trips', async (req, res) => {
  try {
    const trips = await Trip.find({ driverId: req.user._id })
      .populate('routeId', 'name')
      .sort({ startTime: -1 })
      .limit(10)
      .lean();
    res.json({ trips });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch trips' });
  }
});
// Get driver's ongoing trip
driverRouter.get('/ongoing', async (req, res) => {
  try {
    const trip = await Trip.findOne({
      driverId: req.user._id,
      status: 'ongoing'
    })
      .populate('routeId', 'name')
      .lean();
    res.json(trip || null);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch ongoing trip' });
  }
});
router.use('/driver', driverRouter);

// Admin routes
router.use(authenticate, requireRole(ROLE.admin));
router.get('/', getTrips);
router.get('/:id', getTrip);
router.get('/:id/locations', getTripLocations);

export default router;

