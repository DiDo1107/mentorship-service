import { Router, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { authMiddleware } from '../middleware/authMiddleware';
import { AuthRequest } from '../types';

const storage = multer.diskStorage({
  destination: '/app/uploads',
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Разрешены только PDF файлы'));
  },
});

const router = Router();
router.use(authMiddleware);

router.post('/', upload.single('file'), (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Файл не загружен' });
      return;
    }
    res.json({
      data: {
        fileName: req.file.originalname,
        fileUrl: `/uploads/${req.file.filename}`,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
