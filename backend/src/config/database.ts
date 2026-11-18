import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDatabase(): Promise<void> {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(env.MONGODB_URI);
    console.log(`[TaskFlow DB] Successfully connected to MongoDB Atlas (Database: ${mongoose.connection.name})`);
  } catch (error) {
    console.error('[TaskFlow DB] Connection error to MongoDB Atlas:', error);
    process.exit(1);
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
