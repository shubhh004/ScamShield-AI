import type { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { InvalidRefreshTokenError, UnauthorizedError } from '../../lib/errors';
import { env } from '../../config/env';

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_PATH = '/api/v1/auth';

function buildCookieOptions() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: REFRESH_COOKIE_PATH,
  };
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: REFRESH_COOKIE_PATH });
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.registerUser(req.body);
    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, buildCookieOptions());
    res.status(201).json({
      success: true,
      data: { accessToken: result.accessToken, user: result.user },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.loginUser(req.body);
    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, buildCookieOptions());
    res.status(200).json({
      success: true,
      data: { accessToken: result.accessToken, user: result.user },
    });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const incomingToken = req.cookies[REFRESH_COOKIE_NAME] as string | undefined;

    if (incomingToken === undefined) {
      next(new InvalidRefreshTokenError());
      return;
    }

    const result = await authService.refreshAccessToken(incomingToken);
    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, buildCookieOptions());
    res.status(200).json({
      success: true,
      data: { accessToken: result.accessToken },
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;

    if (user === undefined) {
      next(new UnauthorizedError());
      return;
    }

    await authService.logoutUser(user.id);
    clearRefreshCookie(res);
    res.status(200).json({
      success: true,
      data: { message: 'Logged out successfully' },
    });
  } catch (err) {
    next(err);
  }
}
