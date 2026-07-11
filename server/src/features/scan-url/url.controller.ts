import type { Request, Response, NextFunction } from 'express';
import * as urlService from './url.service';

export async function scanUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await urlService.initiateUrlScan(req.body);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}
