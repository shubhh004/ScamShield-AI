import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  ALLOWED_ORIGINS: z
    .string()
    .default('http://localhost:5173')
    .transform((v) => v.split(',')),
  MONGODB_URI: z.string().optional(),
  JWT_ACCESS_SECRET: z.string().default('dev-access-secret-change-in-production'),
  JWT_REFRESH_SECRET: z.string().default('dev-refresh-secret-change-in-production'),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_EXPIRES: z.string().default('7d'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', JSON.stringify(parsed.error.flatten(), null, 2));
  process.exit(1);
}

export const env = parsed.data;
