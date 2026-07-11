import type { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../../lib/errors';
import * as fileService from './scan-file.service';

export async function scanFile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const file = req.file;

    if (file === undefined) {
      next(new ValidationError('No file uploaded. Send a file in the "file" field.'));
      return;
    }

    const result = await fileService.scanFile({
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      buffer: file.buffer,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}
