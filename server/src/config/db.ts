import { logger } from './logger';

// Database connection is configured in Sprint 2 when models are implemented.
export async function connectDatabase(): Promise<void> {
  logger.info('Database connection pending — MongoDB URI not yet configured');
}
