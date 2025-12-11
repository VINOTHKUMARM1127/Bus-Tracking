import { Router } from 'express';
import { authenticate, requireRole, ROLE } from '../middleware/auth.js';
import { DriverLocation } from '../models/DriverLocation.js';
import { Trip } from '../models/Trip.js';
import { addLocationToTrip } from '../controllers/tripController.js';
import { bulkLocationSchema, locationUpdateSchema } from '../utils/validators.js';

// Socket.io instance (set from index.js)
let io = null;
export const setIO = (socketIO) => {
  io = socketIO;
};

const router = Router();

router.use(authenticate, requireRole(ROLE.driver));

router.post('/location', async (req, res) => {
  const { error, value } = locationUpdateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { lat, lng, speed, heading, accuracy } = value;

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

  // Emit Socket.io event
  if (io) {
    const populated = await DriverLocation.findById(location._id)
      .populate('driver', 'username busNumber')
      .lean();
    io.emit('location:update', populated);
  }

  // Check if driver has an ongoing trip and add location to it
  const ongoingTrip = await Trip.findOne({
    driverId: req.user._id,
    status: 'ongoing'
  });

  if (ongoingTrip) {
    await addLocationToTrip(ongoingTrip._id, { lat, lng, speed, heading, accuracy }, req.user._id);
  }

  res.status(201).json(location);
});

// Bulk location sync endpoint for offline queue
router.post('/locations/bulk', async (req, res) => {
  const { error, value } = bulkLocationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { locations } = value;
  const savedLocations = [];
  const errors = [];

  // Get ongoing trip if exists
  const ongoingTrip = await Trip.findOne({
    driverId: req.user._id,
    status: 'ongoing'
  });

  for (const loc of locations) {
    try {
      const payload = {
        driver: req.user._id,
        lat: loc.lat,
        lng: loc.lng,
        speed: loc.speed,
        heading: loc.heading,
        accuracy: loc.accuracy,
        isTracking: true
      };
      if (req.user?.busNumber) {
        payload.busNumber = req.user.busNumber;
      }

      const saved = await DriverLocation.create(payload);
      savedLocations.push(saved);

      // Add to trip if ongoing
      if (ongoingTrip) {
        await addLocationToTrip(
          ongoingTrip._id,
          { lat: loc.lat, lng: loc.lng, speed: loc.speed, heading: loc.heading, accuracy: loc.accuracy },
          req.user._id
        );
      }
    } catch (err) {
      errors.push({ location: loc, error: err.message });
    }
  }

  res.status(201).json({
    saved: savedLocations.length,
    errors: errors.length,
    locations: savedLocations,
    errorDetails: errors
  });
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

// Get current tracking status for the logged-in driver
router.get('/status', async (req, res) => {
  const latest = await DriverLocation.findOne({ driver: req.user._id })
    .sort({ updatedAt: -1 })
    .lean();

  if (!latest) {
    return res.json({ isTracking: false, hasLocation: false });
  }

  return res.json({
    isTracking: latest.isTracking || false,
    hasLocation: true,
    lastUpdate: latest.updatedAt
  });
});

export default router;




