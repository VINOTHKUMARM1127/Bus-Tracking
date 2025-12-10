import { Router } from 'express';
import { authenticate, requireRole, ROLE } from '../middleware/auth.js';
import { DriverLocation } from '../models/DriverLocation.js';

const router = Router();

router.use(authenticate, requireRole(ROLE.driver));

router.post('/location', async (req, res) => {
  const { lat, lng, speed, heading, accuracy } = req.body;
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return res.status(400).json({ message: 'lat and lng are required' });
  }

  const payload = {
    driver: req.user._id,
    lat,
    lng,
    speed,
    heading,
    accuracy,
    isTracking: true
  };
  if (req.user?.busNumber) {
    payload.busNumber = req.user.busNumber;
  }

  const location = await DriverLocation.create(payload);
  res.status(201).json(location);
});

router.post('/location/stop', async (req, res) => {
  const latest = await DriverLocation.findOne({ driver: req.user._id }).sort({ updatedAt: -1 });

  if (latest) {
    latest.isTracking = false;
    await latest.save();
    return res.json(latest);
  }

  return res.status(200).json({ message: 'Tracking stopped' });
});

export default router;



