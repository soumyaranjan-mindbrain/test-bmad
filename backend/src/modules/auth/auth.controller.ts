import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';
import { registerSchema, loginSchema } from './auth.schemas.js';

const REFRESH_COOKIE_NAME = 'taskflow_refresh_token';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedInput = registerSchema.parse(req.body);
      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip;

      const result = await AuthService.register(validatedInput, userAgent, ipAddress);

      res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: result.expiresAt,
        path: '/api/v1/auth',
      });

      res.status(201).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedInput = loginSchema.parse(req.body);
      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip;

      const result = await AuthService.login(validatedInput, userAgent, ipAddress);

      res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: result.expiresAt,
        path: '/api/v1/auth',
      });

      res.status(200).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies[REFRESH_COOKIE_NAME];
      if (!refreshToken) {
        res.status(401).json({
          success: false,
          error: {
            code: 'MISSING_REFRESH_TOKEN',
            message: 'Refresh token cookie is missing. Please log in.',
          },
        });
        return;
      }

      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip;

      const result = await AuthService.refresh(refreshToken, userAgent, ipAddress);

      res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: result.expiresAt,
        path: '/api/v1/auth',
      });

      res.status(200).json({
        success: true,
        data: {
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies[REFRESH_COOKIE_NAME];
      await AuthService.logout(refreshToken);

      res.clearCookie(REFRESH_COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/api/v1/auth',
      });

      res.status(200).json({
        success: true,
        data: {
          message: 'Logged out successfully.',
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
