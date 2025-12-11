import { Trip } from '../models/Trip.js';
import { Alert } from '../models/Alert.js';
import { DriverLocation } from '../models/DriverLocation.js';
import mongoose from 'mongoose';

export const getTripsPerDay = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const matchStage = { status: 'completed' };
    
    if (startDate || endDate) {
      matchStage.startTime = {};
      if (startDate) matchStage.startTime.$gte = new Date(startDate);
      if (endDate) matchStage.startTime.$lte = new Date(endDate);
    }

    const tripsPerDay = await Trip.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$startTime' }
          },
          count: { $sum: 1 },
          totalDistance: { $sum: '$distanceMeters' },
          avgDuration: {
            $avg: {
              $divide: [
                { $subtract: ['$endTime', '$startTime'] },
                1000 * 60 // minutes
              ]
            }
          }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          count: 1,
          totalDistance: 1,
          avgDuration: { $round: ['$avgDuration', 2] }
        }
      }
    ]);

    res.json(tripsPerDay);
  } catch (err) {
    console.error('Get trips per day error:', err);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
};

export const getAverageTripDuration = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const matchStage = { status: 'completed' };
    
    if (startDate || endDate) {
      matchStage.startTime = {};
      if (startDate) matchStage.startTime.$gte = new Date(startDate);
      if (endDate) matchStage.startTime.$lte = new Date(endDate);
    }

    const stats = await Trip.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          avgDuration: {
            $avg: {
              $divide: [
                { $subtract: ['$endTime', '$startTime'] },
                1000 * 60 // minutes
              ]
            }
          },
          minDuration: {
            $min: {
              $divide: [
                { $subtract: ['$endTime', '$startTime'] },
                1000 * 60
              ]
            }
          },
          maxDuration: {
            $max: {
              $divide: [
                { $subtract: ['$endTime', '$startTime'] },
                1000 * 60
              ]
            }
          },
          totalTrips: { $sum: 1 }
        }
      }
    ]);

    res.json(stats[0] || {
      avgDuration: 0,
      minDuration: 0,
      maxDuration: 0,
      totalTrips: 0
    });
  } catch (err) {
    console.error('Get average trip duration error:', err);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
};

export const getTopOverspeedDrivers = async (req, res) => {
  try {
    const { limit = 10, startDate, endDate } = req.query;
    
    const matchStage = { type: 'overspeed' };
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    const topDrivers = await Alert.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$driverId',
          count: { $sum: 1 },
          maxSpeed: { $max: '$speed' },
          avgSpeed: { $avg: '$speed' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'driver'
        }
      },
      { $unwind: { path: '$driver', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          driverId: '$_id',
          driverName: '$driver.username',
          busNumber: '$driver.busNumber',
          alertCount: '$count',
          maxSpeed: { $round: ['$maxSpeed', 1] },
          avgSpeed: { $round: ['$avgSpeed', 1] }
        }
      }
    ]);

    res.json(topDrivers);
  } catch (err) {
    console.error('Get top overspeed drivers error:', err);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalTrips,
      todayTrips,
      activeTrips,
      totalAlerts,
      unacknowledgedAlerts,
      activeDrivers
    ] = await Promise.all([
      Trip.countDocuments({ status: 'completed' }),
      Trip.countDocuments({
        status: 'completed',
        startTime: { $gte: today, $lt: tomorrow }
      }),
      Trip.countDocuments({ status: 'ongoing' }),
      Alert.countDocuments(),
      Alert.countDocuments({ acknowledged: false }),
      DriverLocation.countDocuments({ isTracking: true })
    ]);

    res.json({
      totalTrips,
      todayTrips,
      activeTrips,
      totalAlerts,
      unacknowledgedAlerts,
      activeDrivers
    });
  } catch (err) {
    console.error('Get dashboard stats error:', err);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
};

