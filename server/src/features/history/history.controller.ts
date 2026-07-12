import type { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ValidationError } from '../../lib/errors';
import * as historyService from './history.service';
import { SCAN_TYPES } from './history.types';
import type { HistoryListQuery } from './history.types';

export async function listHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.user === undefined) {
      next(new UnauthorizedError());
      return;
    }

    const query: HistoryListQuery = {};
    const { page, limit, risk, type, sort } = req.query;

    if (page !== undefined) {
      const p = Number(page);
      if (!Number.isInteger(p) || p < 1) {
        next(new ValidationError('page must be a positive integer'));
        return;
      }
      query.page = p;
    }

    if (limit !== undefined) {
      const l = Number(limit);
      if (!Number.isInteger(l) || l < 1 || l > 100) {
        next(new ValidationError('limit must be an integer between 1 and 100'));
        return;
      }
      query.limit = l;
    }

    if (risk !== undefined) {
      if (typeof risk !== 'string' || (risk !== 'LOW' && risk !== 'MEDIUM' && risk !== 'HIGH')) {
        next(new ValidationError('risk must be LOW, MEDIUM, or HIGH'));
        return;
      }
      query.risk = risk;
    }

    if (type !== undefined) {
      if (typeof type !== 'string' || !(SCAN_TYPES as ReadonlyArray<string>).includes(type)) {
        next(new ValidationError(`type must be one of: ${SCAN_TYPES.join(', ')}`));
        return;
      }
      query.type = type as (typeof SCAN_TYPES)[number];
    }

    if (sort !== undefined) {
      if (typeof sort !== 'string' || (sort !== 'asc' && sort !== 'desc')) {
        next(new ValidationError('sort must be asc or desc'));
        return;
      }
      query.sort = sort;
    }

    const { items, pagination } = await historyService.listHistory(req.user.id, query);

    res.status(200).json({ success: true, pagination, history: items });
  } catch (err) {
    next(err);
  }
}

export async function getHistoryEntry(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (req.user === undefined) {
      next(new UnauthorizedError());
      return;
    }

    const id = req.params['id'] ?? '';
    const entry = await historyService.getHistoryById(req.user.id, id);

    res.status(200).json({ success: true, history: entry });
  } catch (err) {
    next(err);
  }
}

export async function deleteHistoryEntry(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (req.user === undefined) {
      next(new UnauthorizedError());
      return;
    }

    const id = req.params['id'] ?? '';
    await historyService.deleteHistoryById(req.user.id, id);

    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
}
