import { Trip } from '../models/Trip.js';
import { Route } from '../models/Route.js';
import { Alert } from '../models/Alert.js';
import { DriverLocation } from '../models/DriverLocation.js';
import { startTripSchema, locationUpdateSchema } from '../utils/validators.js';
import { calculateTotalDistance, calculateAverageSpeed, calculateMaxSpeed } from '../utils/distance.js';
import { checkGeofence, distanceFromGeofence } from '../utils/geofencing.js';
import { env } from '../config/env.js';

// Get io instance (will be set from index.js)
let io = null;
export const setIO = (socketIO) => {
  io = socketIO;
};

const checkSpeedAndGeofence = async (location, driverId, tripId, routeId) => {
  const alerts = [];

  // Check speed limit
  if (location.speed != null && location.speed > 0) {
    const route = routeId ? await Route.findById(routeId).lean() : null;
    const speedLimit = route?.speedLimit || env.overspeedThreshold;

    if (location.speed > speedLimit) {
      const alert = await Alert.create({
        type: 'overspeed',
        driverId,
        tripId,
        routeId,
        location: { lat: location.lat, lng: location.lng },
        speed: location.speed,
        speedLimit,
        message: `Driver exceeded speed limit: ${location.speed.toFixed(1)} km/h (limit: ${speedLimit} km/h)`,
        severity: location.speed > speedLimit * 1.2 ? 'high' : 'medium'
      });

      alerts.push(alert);

      // Emit socket event
      if (io) {
        io.emit('alert:new', alert);
      }
    }
  }

  // Check geofence
  if (routeId) {
    const route = await Route.findById(routeId).lean();
    if (route?.geofence) {
      const isInside = checkGeofence(location.lat, location.lng, route.geofence);
      if (!isInside) {
        const distance = distanceFromGeofence(location.lat, location.lng, route.geofence);
        const alert = await Alert.create({
          type: 'out_of_route',
          driverId,
          tripId,
          routeId,
          location: { lat: location.lat, lng: location.lng },
          distanceFromRoute: distance,
          message: `Driver is out of route. Distance: ${distance.toFixed(0)}m`,
          severity: distance > 1000 ? 'high' : 'medium'
        });

        alerts.push(alert);

        // Emit socket event
        if (io) {
          io.emit('alert:new', alert);
        }
      }
    }
  }

  return alerts;
};

export const startTrip = async (req, res) => {
  try {
    const { error, value } = startTripSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Check if driver has an ongoing trip
    const ongoingTrip = await Trip.findOne({
      driverId: req.user._id,
      status: 'ongoing'
    });

    if (ongoingTrip) {
      return res.status(400).json({ 
        message: 'You already have an ongoing trip. Please end it first.' 
      });
    }

    // Verify route exists
    const route = await Route.findById(value.routeId);
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }

    // Check if driver is assigned to this route (if route has assigned driver)
    if (route.assignedDriver && route.assignedDriver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'You are not assigned to this route' 
      });
    }

    // Get current location
    const latestLocation = await DriverLocation.findOne({ 
      driver: req.user._id 
    }).sort({ updatedAt: -1 });

    if (!latestLocation) {
      return res.status(400).json({ 
        message: 'No location data. Please start tracking first.' 
      });
    }

    const trip = await Trip.create({
      driverId: req.user._id,
      routeId: value.routeId,
      busId: value.busId || req.user.busNumber,
      startTime: new Date(),
      startLocation: {
        lat: latestLocation.lat,
        lng: latestLocation.lng
      },
      locationPoints: [{
        lat: latestLocation.lat,
        lng: latestLocation.lng,
        ts: new Date(),
        speed: latestLocation.speed,
        heading: latestLocation.heading,
        accuracy: latestLocation.accuracy
      }]
    });

    // Emit socket event
    if (io) {
      io.emit('trip:update', { type: 'started', trip });
    }

    res.status(201).json(trip);
  } catch (err) {
    console.error('Start trip error:', err);
    res.status(500).json({ message: 'Failed to start trip' });
  }
};

export const endTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      driverId: req.user._id,
      status: 'ongoing'
    });

    if (!trip) {
      return res.status(404).json({ 
        message: 'Ongoing trip not found' 
      });
    }

    // Get latest location
    const latestLocation = await DriverLocation.findOne({ 
      driver: req.user._id 
    }).sort({ updatedAt: -1 });

    const endLocation = latestLocation 
      ? { lat: latestLocation.lat, lng: latestLocation.lng }
      : trip.locationPoints[trip.locationPoints.length - 1];

    // Calculate metrics
    const distanceMeters = calculateTotalDistance(trip.locationPoints);
    const avgSpeed = calculateAverageSpeed(trip.locationPoints);
    const maxSpeed = calculateMaxSpeed(trip.locationPoints);

    trip.endTime = new Date();
    trip.endLocation = endLocation;
    trip.distanceMeters = distanceMeters;
    trip.avgSpeed = avgSpeed;
    trip.maxSpeed = maxSpeed;
    trip.status = 'completed';

    await trip.save();

    // Emit socket event
    if (io) {
      io.emit('trip:update', { type: 'ended', trip });
    }

    res.json(trip);
  } catch (err) {
    console.error('End trip error:', err);
    res.status(500).json({ message: 'Failed to end trip' });
  }
};

export const addLocationToTrip = async (tripId, location, driverId) => {
  try {
    const trip = await Trip.findById(tripId);
    if (!trip || trip.status !== 'ongoing' || trip.driverId.toString() !== driverId.toString()) {
      return;
    }

    // Add location point
    trip.locationPoints.push({
      lat: location.lat,
      lng: location.lng,
      ts: new Date(),
      speed: location.speed,
      heading: location.heading,
      accuracy: location.accuracy
    });

    await trip.save();

    // Check for alerts
    await checkSpeedAndGeofence(location, driverId, tripId, trip.routeId);

    // Emit socket event
    if (io) {
      io.emit('trip:update', { type: 'location', tripId, location });
    }
  } catch (err) {
    console.error('Add location to trip error:', err);
  }
};

export const getTrips = async (req, res) => {
  try {
    const { driverId, routeId, status, startDate, endDate, page = 1, limit = 50 } = req.query;
    
    const query = {};
    if (driverId) query.driverId = driverId;
    if (routeId) query.routeId = routeId;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) query.startTime.$gte = new Date(startDate);
      if (endDate) query.startTime.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const trips = await Trip.find(query)
      .populate('driverId', 'username busNumber')
      .populate('routeId', 'name')
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Trip.countDocuments(query);

    res.json({
      trips,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Get trips error:', err);
    res.status(500).json({ message: 'Failed to fetch trips' });
  }
};

export const getTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('driverId', 'username busNumber')
      .populate('routeId', 'name stops geofence')
      .lean();

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    res.json(trip);
  } catch (err) {
    console.error('Get trip error:', err);
    res.status(500).json({ message: 'Failed to fetch trip' });
  }
};

export const getTripLocations = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .select('locationPoints')
      .lean();

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    res.json(trip.locationPoints || []);
  } catch (err) {
    console.error('Get trip locations error:', err);
    res.status(500).json({ message: 'Failed to fetch trip locations' });
  }
};

