import dns from 'dns';
dns.setServers(['1.1.1.1', '8.8.8.8']);

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import authRoutes from '../server/routes/auth';
import uploadRoutes from '../server/routes/upload';
import reportRoutes from '../server/routes/reports';
import adminRoutes from '../server/routes/admin';
import analyticsRoutes from '../server/routes/analytics';
import mapRoutes from '../server/routes/map';
import notificationsRoutes from '../server/routes/notifications';
import { errorHandler } from '../server/middleware/errorHandler';
import { logger } from '../server/utils/logger';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Database connection
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
  }
};
// Connect to DB immediately for serverless warm up
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/notifications', notificationsRoutes);

// Base route for healthcheck
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Global Error Handler
app.use(errorHandler);

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    logger.info(`API Server running on port ${PORT}`);
  });
}

// Export for Vercel serverless
export default app;
