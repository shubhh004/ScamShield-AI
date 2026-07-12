import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { explain } from './ai.controller';

const router = Router();

router.use(authenticate());
router.post('/explain', explain);

export default router;
