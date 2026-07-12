import type { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../../lib/errors';
import * as dashboardService from './dashboard.service';

export async function getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.user === undefined) {
      next(new UnauthorizedError());
      return;
    }

    const data = await dashboardService.getDashboardData(req.user.id);

    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
