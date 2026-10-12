import express from 'express';
import Product from '../models/Product.js';
import { upload } from '../middleware/upload.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function matchesFuzzy(query, text) {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t.includes(q)) return true;
  const tolerance = q.length <= 4 ? 1 : 2;
  return levenshtein(q, t.slice(0, q.length + 2)) <= tolerance;
}

router.get('/', async (req, res) => {
  try {
    const filter = { active: { $ne: false } };
    if (req.query.category) filter.category = req.query.category;
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json([]);
    const all = await Product.find({ active: { $ne: false } });
    const results = all.filter(
      (p) => matchesFuzzy(q, p.name) || matchesFuzzy(q, p.category)
    );
    res.json(results.slice(0, 8));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin only: every product including deactivated ones (the public list
// above hides inactive products from customers).
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const { name, category, price, tag, stock } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '';
    // variants arrives as a JSON string because the request is
    // multipart/form-data (needed for the image file) — plain form fields
    // can't carry a nested array/object, so the frontend stringifies it.
    let variants = [];
    if (req.body.variants) {
      try {
        variants = JSON.parse(req.body.variants);
      } catch {
        return res.status(400).json({ message: 'Invalid variants data.' });
      }
    }
    const product = await Product.create({
      name,
      category,
      price,
      tag,
      image,
      stock: stock ?? 0,
      variants,
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const { name, category, price, tag, stock } = req.body;
    const update = Object.fromEntries(
      Object.entries({ name, category, price, tag, stock }).filter(([, v]) => v !== undefined)
    );
    if (req.file) update.image = `/uploads/${req.file.filename}`;
    if (req.body.variants) {
      try {
        update.variants = JSON.parse(req.body.variants);
      } catch {
        return res.status(400).json({ message: 'Invalid variants data.' });
      }
    }
    const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Soft-delete / restore: hides or re-shows a product on the storefront
// without removing it, so existing orders that reference it stay valid.
router.patch('/:id/active', protect, adminOnly, async (req, res) => {
  try {
    const { active } = req.body;
    const product = await Product.findByIdAndUpdate(req.params.id, { active: !!active }, { new: true });
    if (!product) return res.status(404).json({ message: 'Not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Quick inventory update from the admin Inventory tab.
router.patch('/:id/stock', protect, adminOnly, async (req, res) => {
  try {
    const stock = Number(req.body.stock);
    if (!Number.isInteger(stock) || stock < 0) {
      return res.status(400).json({ message: 'Stock must be a whole number, 0 or more.' });
    }
    const product = await Product.findByIdAndUpdate(req.params.id, { stock }, { new: true });
    if (!product) return res.status(404).json({ message: 'Not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
