import type { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ValidationError } from '../../lib/errors';
import * as aiService from './ai.service';

export async function explain(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.user === undefined) {
      next(new UnauthorizedError());
      return;
    }

    const body = req.body as Record<string, unknown>;
    const rawScanId = body['scanId'];
    const rawQuestion = body['question'];

    if (typeof rawScanId !== 'string' || rawScanId.trim().length === 0) {
      next(new ValidationError('scanId is required'));
      return;
    }

    const question =
      typeof rawQuestion === 'string' && rawQuestion.trim().length > 0
        ? rawQuestion.trim()
        : undefined;

    const data = await aiService.explainScan(req.user.id, rawScanId.trim(), question);

    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
