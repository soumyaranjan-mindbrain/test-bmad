import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateAccessToken(payload: { userId: string; email: string; isSuperAdmin: boolean }): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
}

export function verifyAccessToken(token: string): { userId: string; email: string; isSuperAdmin: boolean } {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as { userId: string; email: string; isSuperAdmin: boolean };
}

export function generateRefreshToken(): { token: string; hash: string; expiresAt: Date } {
  const token = crypto.randomBytes(40).toString('hex');
  const hash = hashToken(token);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  return { token, hash, expiresAt };
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
