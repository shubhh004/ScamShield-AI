import type { Request, Response, NextFunction } from 'express';
import * as smsService from './sms.service';

export async function scanSms(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await smsService.initiateSmsScan(req.body);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}
