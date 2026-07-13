import type { Request, Response, NextFunction, CookieOptions } from 'express';
import * as authService from './auth.service';
import { InvalidRefreshTokenError, UnauthorizedError } from '../../lib/errors';
import { env } from '../../config/env';

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_PATH = '/api/v1/auth';

function buildCookieOptions(): CookieOptions {
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

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    if (user === undefined) {
      next(new UnauthorizedError());
      return;
    }
    const profile = await authService.getMe(user.id);
    res.status(200).json({
      success: true,
      data: { user: profile },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    if (user === undefined) { next(new UnauthorizedError()); return; }
    const updated = await authService.updateProfile(user.id, req.body);
    res.status(200).json({ success: true, data: { user: updated } });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    if (user === undefined) { next(new UnauthorizedError()); return; }
    await authService.changePassword(user.id, req.body);
    res.status(200).json({ success: true, data: { message: 'Password changed successfully' } });
  } catch (err) {
    next(err);
  }
}

export async function deleteAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    if (user === undefined) { next(new UnauthorizedError()); return; }
    await authService.deleteAccount(user.id);
    clearRefreshCookie(res);
    res.status(200).json({ success: true, data: { message: 'Account deleted successfully' } });
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
