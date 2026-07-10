import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import type { AccessTokenPayload, RefreshTokenPayload } from '../features/auth/auth.types';

type VerifyAccessResult =
  | { payload: AccessTokenPayload; error: null }
  | { payload: null; error: 'expired' | 'invalid' };

type VerifyRefreshResult =
  | { payload: RefreshTokenPayload; error: null }
  | { payload: null; error: 'expired' | 'invalid' };

export function generateAccessToken(payload: Omit<AccessTokenPayload, 'type' | 'iat' | 'exp'>): string {
  return jwt.sign(
    { ...payload, type: 'access' },
    env.JWT_ACCESS_SECRET,
    // Cast needed: exactOptionalPropertyTypes + StringValue branded type incompatibility
    { expiresIn: env.JWT_ACCESS_EXPIRES } as unknown as jwt.SignOptions,
  );
}

export function generateRefreshToken(sub: string): string {
  return jwt.sign(
    { sub, type: 'refresh' },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES } as unknown as jwt.SignOptions,
  );
}

export function verifyAccessToken(token: string): VerifyAccessResult {
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
    return { payload, error: null };
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return { payload: null, error: 'expired' };
    }
    return { payload: null, error: 'invalid' };
  }
}

export function verifyRefreshToken(token: string): VerifyRefreshResult {
  try {
    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
    return { payload, error: null };
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return { payload: null, error: 'expired' };
    }
    return { payload: null, error: 'invalid' };
  }
}
