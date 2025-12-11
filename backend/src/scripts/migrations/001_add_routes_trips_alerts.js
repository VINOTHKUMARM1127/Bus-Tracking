/**
 * Migration script to ensure Routes, Trips, and Alerts collections exist
 * Run with: node src/scripts/migrations/001_add_routes_trips_alerts.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Route } from '../../models/Route.js';
import { Trip } from '../../models/Trip.js';
import { Alert } from '../../models/Alert.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smart-bus';

async function runMigration() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Create indexes if they don't exist
    console.log('Creating indexes...');
    
    await Route.createIndexes();
    await Trip.createIndexes();
    await Alert.createIndexes();

    console.log('Migration completed successfully!');
    console.log('Collections: routes, trips, alerts are ready.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

runMigration();

