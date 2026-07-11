import { Router } from 'express';
import { scanSms } from './sms.controller';
import { validate } from '../../middleware/validate.middleware';
import { smsScanInputSchema } from './sms.schema';

const router = Router();

router.post('/sms', validate(smsScanInputSchema), scanSms);

export default router;
