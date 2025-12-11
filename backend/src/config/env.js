import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: process.env.PORT || '4000',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/smart-bus',
  jwtSecret: process.env.JWT_SECRET || 'change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  adminDefaultUser: process.env.ADMIN_USERNAME || 'admin',
  adminDefaultPass: process.env.ADMIN_PASSWORD || 'admin123',
  locationHistoryLimit: Number(process.env.LOCATION_HISTORY_LIMIT || 50)
};




