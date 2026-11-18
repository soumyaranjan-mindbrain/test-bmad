import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000').transform(Number),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/taskflow'),
  JWT_ACCESS_SECRET: z.string().min(16).default('development_access_secret_key_32chars_min'),
  JWT_REFRESH_SECRET: z.string().min(16).default('development_refresh_secret_key_32chars_min'),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
});

export const env = envSchema.parse(process.env);
