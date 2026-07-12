import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { listHistory, getHistoryEntry, deleteHistoryEntry } from './history.controller';

const router = Router();

router.use(authenticate());
router.get('/', listHistory);
router.get('/:id', getHistoryEntry);
router.delete('/:id', deleteHistoryEntry);

export default router;
