import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../lib/jwt.utils';
import { TokenExpiredError, UnauthorizedError } from '../lib/errors';

function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers['authorization'];
  if (authHeader === undefined || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}

export function authenticate() {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const token = extractBearerToken(req);

    if (token === null) {
      next(new UnauthorizedError());
      return;
    }

    const result = verifyAccessToken(token);

    if (result.error === 'expired') {
      next(new TokenExpiredError());
      return;
    }

    if (result.error === 'invalid' || result.payload === null) {
      next(new UnauthorizedError('Invalid authentication token'));
      return;
    }

    req.user = {
      id: result.payload.sub,
      email: result.payload.email,
      role: result.payload.role,
      isEmailVerified: result.payload.isEmailVerified,
    };

    next();
  };
}

export function optionalAuth() {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const token = extractBearerToken(req);

    if (token === null) {
      next();
      return;
    }

    const result = verifyAccessToken(token);

    if (result.payload !== null) {
      req.user = {
        id: result.payload.sub,
        email: result.payload.email,
        role: result.payload.role,
        isEmailVerified: result.payload.isEmailVerified,
      };
    }

    next();
  };
}
