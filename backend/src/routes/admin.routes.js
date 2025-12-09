import { Router } from 'express';
import { authenticate, requireRole, ROLE } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { DriverLocation } from '../models/DriverLocation.js';
import { hashPassword } from '../utils/auth.js';
import { getDriverLocation, getLatestLocations } from '../controllers/locationController.js';

const router = Router();

router.use(authenticate, requireRole(ROLE.admin));

router.post('/drivers', async (req, res) => {
  const { username, password, busNumber } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const existing = await User.findOne({ username });
  if (existing) {
    return res.status(409).json({ message: 'Username already exists' });
  }

  const passwordHash = await hashPassword(password);
  const driver = await User.create({
    username,
    passwordHash,
    busNumber,
    role: ROLE.driver
  });

  return res.status(201).json({
    id: driver._id.toString(),
    username: driver.username,
    role: driver.role,
    busNumber: driver.busNumber
  });
});

router.get('/drivers', async (_req, res) => {
  const drivers = await User.find({ role: ROLE.driver })
    .select('username role busNumber isActive createdAt updatedAt')
    .lean();
  res.json(drivers);
});

router.patch('/drivers/:id/bus', async (req, res) => {
  const { busNumber } = req.body;
  const driver = await User.findOneAndUpdate(
    { _id: req.params.id, role: ROLE.driver },
    { busNumber },
    { new: true }
  ).select('username role busNumber');

  if (!driver) {
    return res.status(404).json({ message: 'Driver not found' });
  }
  res.json(driver);
});

router.patch('/drivers/:id/status', async (req, res) => {
  const { isActive } = req.body;
  const driver = await User.findOneAndUpdate(
    { _id: req.params.id, role: ROLE.driver },
    { isActive: Boolean(isActive) },
    { new: true }
  ).select('username role busNumber isActive');

  if (!driver) {
    return res.status(404).json({ message: 'Driver not found' });
  }
  res.json(driver);
});

router.patch('/drivers/:id/password', async (req, res) => {
  const { password } = req.body;
  if (!password || typeof password !== 'string' || password.trim().length < 4) {
    return res.status(400).json({ message: 'Password must be at least 4 characters' });
  }

  const driver = await User.findOne({ _id: req.params.id, role: ROLE.driver });
  if (!driver) {
    return res.status(404).json({ message: 'Driver not found' });
  }

  driver.passwordHash = await hashPassword(password.trim());
  await driver.save();

  res.json({ message: 'Password updated' });
});

router.delete('/drivers/:id', async (req, res) => {
  const driver = await User.findOne({ _id: req.params.id, role: ROLE.driver });
  if (!driver) {
    return res.status(404).json({ message: 'Driver not found' });
  }

  await User.deleteOne({ _id: driver._id });
  await DriverLocation.deleteMany({ driver: driver._id });

  res.json({ message: 'Driver deleted' });
});

router.get('/drivers/:id/location', getDriverLocation);
router.get('/locations', getLatestLocations);

export default router;


