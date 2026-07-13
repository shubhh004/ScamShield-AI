import { Router } from 'express';
import {
  register,
  login,
  refresh,
  logout,
  me,
  updateProfile,
  changePassword,
  deleteAccount,
} from './auth.controller';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import {
  registerInputSchema,
  loginInputSchema,
  updateProfileSchema,
  changePasswordSchema,
} from './auth.schema';

const router = Router();

router.post('/register', validate(registerInputSchema), register);
router.post('/login', validate(loginInputSchema), login);
router.post('/refresh', refresh);
router.post('/logout', authenticate(), logout);
router.get('/me', authenticate(), me);
router.patch('/profile', authenticate(), validate(updateProfileSchema), updateProfile);
router.post('/change-password', authenticate(), validate(changePasswordSchema), changePassword);
router.delete('/account', authenticate(), deleteAccount);

export default router;
