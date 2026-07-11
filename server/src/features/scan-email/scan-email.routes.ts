import { Router } from 'express';
import { scanEmail } from './scan-email.controller';
import { validate } from '../../middleware/validate.middleware';
import { scanEmailInputSchema } from './scan-email.schema';

const router = Router();

router.post('/email', validate(scanEmailInputSchema), scanEmail);

export default router;
