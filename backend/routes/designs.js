import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

const uploadDir = path.join(process.cwd(), 'uploads', 'designs');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `design-${unique}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  const allowed = /jpeg|jpg|png|webp|gif/;
  const ok = allowed.test(path.extname(file.originalname).toLowerCase());
  cb(ok ? null : new Error('Only image files are allowed'), ok);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB, designs can be higher-res
});

// POST /api/designs/upload  — only called once the user completes checkout
router.post('/upload', upload.single('design'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No design file provided' });
    }

    const { productId, productName } = req.body;

    res.status(201).json({
      url: `/uploads/designs/${req.file.filename}`,
      productId: productId || null,
      productName: productName || null,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
