import express from 'express';
import User from '../models/User.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// GET /api/users/me — return the currently logged-in user's profile.
// (Kept here as well as /api/auth/me so either path works as the app grows.)
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users — admin only: list all registered users.
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/users/:id/role — admin only: promote or demote a user.
// This is how new admins should be created after the first one exists —
// no direct database access needed.
router.patch('/:id/role', protect, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['customer', 'admin'].includes(role)) {
      return res.status(400).json({ message: "Role must be 'customer' or 'admin'." });
    }
    if (req.user.id === req.params.id && role !== 'admin') {
      return res.status(400).json({ message: 'You cannot remove your own admin access.' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
