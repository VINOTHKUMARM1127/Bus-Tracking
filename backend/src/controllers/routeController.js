import { Route } from '../models/Route.js';
import { routeSchema } from '../utils/validators.js';

export const createRoute = async (req, res) => {
  try {
    const { error, value } = routeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const route = await Route.create({
      ...value,
      createdBy: req.user._id
    });

    res.status(201).json(route);
  } catch (err) {
    console.error('Create route error:', err);
    res.status(500).json({ message: 'Failed to create route' });
  }
};

export const getRoutes = async (req, res) => {
  try {
    const routes = await Route.find({ isActive: true })
      .populate('createdBy', 'username')
      .populate('assignedDriver', 'username busNumber')
      .sort({ createdAt: -1 })
      .lean();

    res.json(routes);
  } catch (err) {
    console.error('Get routes error:', err);
    res.status(500).json({ message: 'Failed to fetch routes' });
  }
};

export const getRoute = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id)
      .populate('createdBy', 'username')
      .populate('assignedDriver', 'username busNumber')
      .lean();

    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }

    res.json(route);
  } catch (err) {
    console.error('Get route error:', err);
    res.status(500).json({ message: 'Failed to fetch route' });
  }
};

export const updateRoute = async (req, res) => {
  try {
    const { error, value } = routeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const route = await Route.findByIdAndUpdate(
      req.params.id,
      value,
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'username')
      .populate('assignedDriver', 'username busNumber');

    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }

    res.json(route);
  } catch (err) {
    console.error('Update route error:', err);
    res.status(500).json({ message: 'Failed to update route' });
  }
};

export const deleteRoute = async (req, res) => {
  try {
    const route = await Route.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }

    res.json({ message: 'Route deleted' });
  } catch (err) {
    console.error('Delete route error:', err);
    res.status(500).json({ message: 'Failed to delete route' });
  }
};

export const assignDriverToRoute = async (req, res) => {
  try {
    const { driverId } = req.body;
    if (!driverId) {
      return res.status(400).json({ message: 'Driver ID is required' });
    }

    const route = await Route.findByIdAndUpdate(
      req.params.id,
      { assignedDriver: driverId },
      { new: true }
    )
      .populate('assignedDriver', 'username busNumber');

    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }

    res.json(route);
  } catch (err) {
    console.error('Assign driver error:', err);
    res.status(500).json({ message: 'Failed to assign driver' });
  }
};

