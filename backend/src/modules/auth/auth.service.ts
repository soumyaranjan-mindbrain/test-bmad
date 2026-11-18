import { User } from '../../models/User.js';
import { UserSession } from '../../models/UserSession.js';
import { hashPassword, verifyPassword, generateAccessToken, generateRefreshToken, hashToken } from '../../utils/token.js';
import { AppError } from '../../utils/errors.js';
import { RegisterInput, LoginInput } from './auth.schemas.js';

export class AuthService {
  static async register(input: RegisterInput, userAgent?: string, ipAddress?: string) {
    const existingUser = await User.findOne({ email: input.email });
    if (existingUser) {
      throw new AppError('An account with this email address already exists.', 409, 'EMAIL_ALREADY_EXISTS');
    }

    const passwordHash = await hashPassword(input.password);
    const user = await User.create({
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      status: 'active',
      isSuperAdmin: false,
    });

    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      isSuperAdmin: user.isSuperAdmin,
    });

    const refresh = generateRefreshToken();
    await UserSession.create({
      userId: user._id,
      refreshTokenHash: refresh.hash,
      userAgent,
      ipAddress,
      expiresAt: refresh.expiresAt,
    });

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken: refresh.token,
      expiresAt: refresh.expiresAt,
    };
  }

  static async login(input: LoginInput, userAgent?: string, ipAddress?: string) {
    const user = await User.findOne({ email: input.email });
    if (!user) {
      throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    }

    if (user.status === 'suspended') {
      throw new AppError('Your account has been suspended. Please contact support.', 403, 'ACCOUNT_SUSPENDED');
    }

    const isValid = await verifyPassword(input.password, user.passwordHash);
    if (!isValid) {
      throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    }

    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      isSuperAdmin: user.isSuperAdmin,
    });

    const refresh = generateRefreshToken();
    await UserSession.create({
      userId: user._id,
      refreshTokenHash: refresh.hash,
      userAgent,
      ipAddress,
      expiresAt: refresh.expiresAt,
    });

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken: refresh.token,
      expiresAt: refresh.expiresAt,
    };
  }

  static async refresh(refreshToken: string, userAgent?: string, ipAddress?: string) {
    const tokenHash = hashToken(refreshToken);
    const session = await UserSession.findOne({ refreshTokenHash: tokenHash });

    if (!session || session.expiresAt < new Date()) {
      if (session) await UserSession.findByIdAndDelete(session._id);
      throw new AppError('Invalid or expired refresh token. Please log in again.', 401, 'INVALID_REFRESH_TOKEN');
    }

    const user = await User.findById(session.userId);
    if (!user || user.status === 'suspended') {
      await UserSession.findByIdAndDelete(session._id);
      throw new AppError('User not found or suspended.', 403, 'ACCOUNT_INACTIVE');
    }

    // Silent Token Rotation: Invalidate previous session and create new
    await UserSession.findByIdAndDelete(session._id);

    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      isSuperAdmin: user.isSuperAdmin,
    });

    const newRefresh = generateRefreshToken();
    await UserSession.create({
      userId: user._id,
      refreshTokenHash: newRefresh.hash,
      userAgent,
      ipAddress,
      expiresAt: newRefresh.expiresAt,
    });

    return {
      accessToken,
      refreshToken: newRefresh.token,
      expiresAt: newRefresh.expiresAt,
    };
  }

  static async logout(refreshToken?: string) {
    if (refreshToken) {
      const tokenHash = hashToken(refreshToken);
      await UserSession.findOneAndDelete({ refreshTokenHash: tokenHash });
    }
  }
}
