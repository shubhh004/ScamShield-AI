import type { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../../lib/errors';
import * as analyticsService from './analytics.service';

export async function getAnalytics(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (req.user === undefined) {
      next(new UnauthorizedError());
      return;
    }

    const data = await analyticsService.getAnalyticsData(req.user.id);

    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
