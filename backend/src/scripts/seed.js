/**
 * Seed script to create sample data
 * Run with: node src/scripts/seed.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDb } from '../config/db.js';
import { User, USER_ROLES } from '../models/User.js';
import { Route } from '../models/Route.js';
import { Trip } from '../models/Trip.js';
import { hashPassword } from '../utils/auth.js';

dotenv.config();

async function seed() {
  try {
    console.log('Connecting to database...');
    await connectDb();

    // Create sample admin if doesn't exist
    const adminExists = await User.findOne({ role: USER_ROLES.admin });
    if (!adminExists) {
      const adminPassword = await hashPassword('admin123');
      await User.create({
        username: 'admin',
        passwordHash: adminPassword,
        role: USER_ROLES.admin
      });
      console.log('✓ Admin user created (username: admin, password: admin123)');
    }

    // Create sample drivers
    const driver1 = await User.findOne({ username: 'driver1' });
    if (!driver1) {
      const driver1Password = await hashPassword('driver123');
      const d1 = await User.create({
        username: 'driver1',
        passwordHash: driver1Password,
        role: USER_ROLES.driver,
        busNumber: 'BUS-001'
      });
      console.log('✓ Driver 1 created (username: driver1, password: driver123)');

      // Create sample route
      const route = await Route.create({
        name: 'Route 1 - Main Street',
        stops: [
          { lat: 12.9716, lng: 77.5946, name: 'Start Point', etaOrder: 0 },
          { lat: 12.9352, lng: 77.6245, name: 'Stop 1', etaOrder: 1 },
          { lat: 12.9141, lng: 77.6416, name: 'Stop 2', etaOrder: 2 },
          { lat: 12.8998, lng: 77.6587, name: 'End Point', etaOrder: 3 }
        ],
        geofence: {
          type: 'circle',
          coords: {
            center: [12.9352, 77.6245],
            radius: 5000 // 5km radius
          }
        },
        speedLimit: 60,
        createdBy: adminExists?._id || (await User.findOne({ role: USER_ROLES.admin }))._id,
        assignedDriver: d1._id
      });
      console.log('✓ Sample route created');

      // Create sample completed trip
      const startTime = new Date();
      startTime.setHours(8, 0, 0, 0);
      const endTime = new Date(startTime);
      endTime.setHours(9, 30, 0, 0);

      await Trip.create({
        driverId: d1._id,
        routeId: route._id,
        busId: 'BUS-001',
        startTime,
        endTime,
        startLocation: { lat: 12.9716, lng: 77.5946 },
        endLocation: { lat: 12.8998, lng: 77.6587 },
        distanceMeters: 15000,
        avgSpeed: 45,
        maxSpeed: 65,
        status: 'completed',
        locationPoints: [
          { lat: 12.9716, lng: 77.5946, ts: startTime, speed: 0 },
          { lat: 12.9500, lng: 77.6100, ts: new Date(startTime.getTime() + 20 * 60000), speed: 50 },
          { lat: 12.9352, lng: 77.6245, ts: new Date(startTime.getTime() + 40 * 60000), speed: 45 },
          { lat: 12.9141, lng: 77.6416, ts: new Date(startTime.getTime() + 60 * 60000), speed: 40 },
          { lat: 12.8998, lng: 77.6587, ts: endTime, speed: 0 }
        ]
      });
      console.log('✓ Sample trip created');
    }

    const driver2 = await User.findOne({ username: 'driver2' });
    if (!driver2) {
      const driver2Password = await hashPassword('driver123');
      await User.create({
        username: 'driver2',
        passwordHash: driver2Password,
        role: USER_ROLES.driver,
        busNumber: 'BUS-002'
      });
      console.log('✓ Driver 2 created (username: driver2, password: driver123)');
    }

    console.log('\n✓ Seeding completed!');
    console.log('\nSample credentials:');
    console.log('Admin: admin / admin123');
    console.log('Driver 1: driver1 / driver123');
    console.log('Driver 2: driver2 / driver123');
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from database');
  }
}

seed();

