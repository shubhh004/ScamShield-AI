import { Router } from 'express';
import { scanUrl } from './url.controller';
import { validate } from '../../middleware/validate.middleware';
import { scanUrlInputSchema } from './url.schema';

const router = Router();

router.post('/url', validate(scanUrlInputSchema), scanUrl);

export default router;
