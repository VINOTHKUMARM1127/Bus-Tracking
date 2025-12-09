import { DriverLocation } from '../models/DriverLocation.js';
import { env } from '../config/env.js';

export const getLatestLocations = async (_req, res) => {
  const latest = await DriverLocation.aggregate([
    { $sort: { updatedAt: -1 } },
    { $group: { _id: '$driver', doc: { $first: '$$ROOT' } } },
    { $replaceRoot: { newRoot: '$doc' } }
  ]);
  res.json(latest);
};

export const getDriverLocation = async (req, res) => {
  const limit = Math.max(1, env.locationHistoryLimit || 50);
  const history = await DriverLocation.find({ driver: req.params.id })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .lean();

  if (!history.length) {
    return res.status(404).json({ message: 'No location for driver' });
  }

  res.json({ latest: history[0], history });
};


