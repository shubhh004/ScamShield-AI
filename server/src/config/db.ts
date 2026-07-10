import mongoose from 'mongoose';
import { env } from './env';
import { logger } from './logger';

export async function connectDatabase(): Promise<void> {
  if (env.MONGODB_URI === undefined) {
    logger.warn('MONGODB_URI not set — database features will be unavailable');
    return;
  }

  try {
    await mongoose.connect(env.MONGODB_URI);
    logger.info('MongoDB connected');
  } catch (err) {
    logger.error('MongoDB connection failed', { error: String(err) });
    process.exit(1);
  }
}
