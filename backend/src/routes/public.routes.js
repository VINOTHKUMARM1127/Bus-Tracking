import { Router } from 'express';
import { DriverLocation } from '../models/DriverLocation.js';
import { Trip } from '../models/Trip.js';
import { Route } from '../models/Route.js';
import { haversineDistance } from '../utils/distance.js';

const router = Router();

// Public endpoint for student app - get live bus locations
router.get('/buses/live', async (req, res) => {
  try {
    const latest = await DriverLocation.aggregate([
      { $match: { isTracking: true } },
      { $sort: { updatedAt: -1 } },
      { $group: { _id: '$driver', doc: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$doc' } },
      {
        $lookup: {
          from: 'users',
          localField: 'driver',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'trips',
          let: { driverId: '$driver' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$driverId', '$$driverId'] },
                    { $eq: ['$status', 'ongoing'] }
                  ]
                }
              }
            }
          ],
          as: 'trip'
        }
      },
      { $unwind: { path: '$trip', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'routes',
          localField: 'trip.routeId',
          foreignField: '_id',
          as: 'route'
        }
      },
      { $unwind: { path: '$route', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          busId: { $ifNull: ['$busNumber', '$user.busNumber'] },
          routeId: '$route._id',
          routeName: '$route.name',
          lat: 1,
          lng: 1,
          speed: 1,
          heading: 1,
          updatedAt: 1
        }
      }
    ]);

    // Calculate ETA to stops for each bus
    const busesWithETA = await Promise.all(
      latest.map(async (bus) => {
        if (!bus.routeId) {
          return { ...bus, etaToStops: [] };
        }

        const route = await Route.findById(bus.routeId).lean();
        if (!route || !route.stops || route.stops.length === 0) {
          return { ...bus, etaToStops: [] };
        }

        // Simple linear ETA calculation based on current speed
        const currentSpeed = bus.speed || 0; // km/h
        const etaToStops = route.stops
          .sort((a, b) => a.etaOrder - b.etaOrder)
          .map((stop) => {
            const distance = haversineDistance(
              bus.lat,
              bus.lng,
              stop.lat,
              stop.lng
            ); // meters
            const distanceKm = distance / 1000;
            const etaMinutes =
              currentSpeed > 0 ? (distanceKm / currentSpeed) * 60 : null;

            return {
              stopName: stop.name,
              lat: stop.lat,
              lng: stop.lng,
              distance: Math.round(distance),
              etaMinutes: etaMinutes ? Math.round(etaMinutes) : null
            };
          });

        return { ...bus, etaToStops };
      })
    );

    res.json(busesWithETA);
  } catch (err) {
    console.error('Get live buses error:', err);
    res.status(500).json({ message: 'Failed to fetch live buses' });
  }
});

export default router;

