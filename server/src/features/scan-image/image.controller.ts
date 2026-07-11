import type { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../../lib/errors';
import * as imageService from './image.service';

export async function scanImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) {
      next(new ValidationError('Image file is required'));
      return;
    }
    const result = await imageService.initiateImageScan(req.file.buffer);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
