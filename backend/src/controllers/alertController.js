import { Alert } from '../models/Alert.js';

export const getAlerts = async (req, res) => {
  try {
    const { driverId, type, acknowledged, severity, page = 1, limit = 50 } = req.query;
    
    const query = {};
    if (driverId) query.driverId = driverId;
    if (type) query.type = type;
    if (acknowledged !== undefined) query.acknowledged = acknowledged === 'true';
    if (severity) query.severity = severity;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const alerts = await Alert.find(query)
      .populate('driverId', 'username busNumber')
      .populate('tripId', 'routeId startTime')
      .populate('routeId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Alert.countDocuments(query);

    res.json({
      alerts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Get alerts error:', err);
    res.status(500).json({ message: 'Failed to fetch alerts' });
  }
};

export const acknowledgeAlert = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      {
        acknowledged: true,
        acknowledgedBy: req.user._id,
        acknowledgedAt: new Date()
      },
      { new: true }
    )
      .populate('driverId', 'username busNumber')
      .populate('tripId', 'routeId startTime')
      .populate('routeId', 'name');

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    res.json(alert);
  } catch (err) {
    console.error('Acknowledge alert error:', err);
    res.status(500).json({ message: 'Failed to acknowledge alert' });
  }
};

export const getUnacknowledgedCount = async (req, res) => {
  try {
    const count = await Alert.countDocuments({ acknowledged: false });
    res.json({ count });
  } catch (err) {
    console.error('Get unacknowledged count error:', err);
    res.status(500).json({ message: 'Failed to get count' });
  }
};

