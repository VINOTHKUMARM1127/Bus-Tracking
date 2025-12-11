import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { connectDb } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import driverRoutes from './routes/driver.routes.js';
import routeRoutes from './routes/route.routes.js';
import tripRoutes from './routes/trip.routes.js';
import alertRoutes from './routes/alert.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import publicRoutes from './routes/public.routes.js';
import { setIO } from './controllers/tripController.js';
import { DriverLocation } from './models/DriverLocation.js';

const app = express();
const httpServer = createServer(app);

// CORS configuration for Vercel deployments
const allowedOrigins = [
  'https://bus-tracking-tau.vercel.app',
  'https://bus-tracking-driver.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174'
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all for now, tighten in production
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false
  })
);
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api', publicRoutes);

// Socket.io setup
let io = null;
if (env.enableSocketIO) {
  io = new Server(httpServer, {
    path: env.socketIOPath,
    cors: {
      origin: env.corsOrigin === '*' ? true : env.corsOrigin.split(','),
      credentials: true
    }
  });

  // Set io instance for trip controller and driver routes
  setIO(io);
  const driverRoutesModule = await import('./routes/driver.routes.js');
  if (driverRoutesModule.setIO) {
    driverRoutesModule.setIO(io);
  }

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    // Admin can join admin room for real-time updates
    socket.on('join:admin', () => {
      socket.join('admin');
      console.log('Admin joined:', socket.id);
    });
  });

  console.log('Socket.io enabled on path:', env.socketIOPath);
} else {
  console.log('Socket.io disabled');
}

const start = async () => {
  await connectDb();
  const port = Number(env.port) || 4000;
  httpServer.listen(port, () => {
    console.log(`Server running on port ${port}`);
    if (env.enableSocketIO) {
      console.log(`Socket.io enabled on ${env.socketIOPath}`);
    }
  });
};

start();


