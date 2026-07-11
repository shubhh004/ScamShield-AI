import { Router } from 'express';
import multer from 'multer';
import { ValidationError } from '../../lib/errors';
import { scanFile } from './scan-file.controller';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
});

const router = Router();

// Wrap multer so its errors are translated to AppError before reaching the
// global handler — multer errors never reach the controller try/catch.
router.post(
  '/file',
  (req, res, next) => {
    upload.single('file')(req, res, (err: unknown) => {
      if (err instanceof multer.MulterError) {
        const message =
          err.code === 'LIMIT_FILE_SIZE'
            ? 'File size exceeds 10 MB limit'
            : `Upload error: ${err.message}`;
        next(new ValidationError(message));
        return;
      }
      if (err !== null && err !== undefined) {
        next(err);
        return;
      }
      next();
    });
  },
  scanFile,
);

export default router;
