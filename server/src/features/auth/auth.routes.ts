import { Router } from 'express';
import { register, login, refresh, logout, me } from './auth.controller';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { registerInputSchema, loginInputSchema } from './auth.schema';

const router = Router();

router.post('/register', validate(registerInputSchema), register);
router.post('/login', validate(loginInputSchema), login);
router.post('/refresh', refresh);
router.post('/logout', authenticate(), logout);
router.get('/me', authenticate(), me);

export default router;
