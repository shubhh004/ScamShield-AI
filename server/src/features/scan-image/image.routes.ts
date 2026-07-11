import { Router } from 'express';
import multer from 'multer';
import { ValidationError } from '../../lib/errors';
import { MAX_IMAGE_SIZE, ALLOWED_MIME_TYPES, ALLOWED_EXTENSIONS } from './image.schema';
import { scanImage } from './image.controller';

function getExtension(filename: string): string {
  const dot = filename.lastIndexOf('.');
  return dot === -1 ? '' : filename.slice(dot).toLowerCase();
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter: (_req, file, cb) => {
    const ext = getExtension(file.originalname);
    const mimeOk = ALLOWED_MIME_TYPES.has(file.mimetype);
    const extOk = ALLOWED_EXTENSIONS.has(ext);

    if (mimeOk || (file.mimetype === 'application/octet-stream' && extOk)) {
      cb(null, true);
    } else {
      cb(new ValidationError('Only JPEG and PNG images are allowed') as unknown as Error);
    }
  },
});

const router = Router();

router.post(
  '/image',
  (req, res, next) => {
    upload.single('image')(req, res, (err: unknown) => {
      if (err instanceof multer.MulterError) {
        const message =
          err.code === 'LIMIT_FILE_SIZE'
            ? 'Image size exceeds 5 MB limit'
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
  scanImage,
);

export default router;
