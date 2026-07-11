import type { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../../lib/errors';
import * as qrService from './qr.service';

export async function scanQr(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) {
      next(new ValidationError('Image file is required'));
      return;
    }
    const result = await qrService.initiateQrScan(req.file.buffer);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
