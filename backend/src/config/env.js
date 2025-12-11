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
  locationHistoryLimit: Number(process.env.LOCATION_HISTORY_LIMIT || 50),
  
  // Speed Monitoring
  overspeedThreshold: Number(process.env.OVERSPEED_THRESHOLD || 60),
  
  // Socket.io Configuration
  enableSocketIO: process.env.ENABLE_SOCKET_IO === 'true' || process.env.ENABLE_SOCKET_IO === undefined,
  socketIOPath: process.env.SOCKET_IO_PATH || '/socket.io',
  
  // Geofencing Configuration
  geohashPrecision: Number(process.env.GEOHASH_PRECISION || 7),
  
  // API Configuration
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:4000/api'
};




