import type { Request, Response, NextFunction } from 'express';
import * as emailService from './scan-email.service';

export async function scanEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await emailService.initiateEmailScan(req.body);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}
