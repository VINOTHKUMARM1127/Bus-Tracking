import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { connectDb } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import driverRoutes from './routes/driver.routes.js';

const app = express();

// Support multiple comma-separated origins for dev (e.g., admin + driver apps)
const corsOrigins = env.corsOrigin
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins
  })
);
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/driver', driverRoutes);

const start = async () => {
  await connectDb();
  const port = Number(env.port) || 4000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

start();


