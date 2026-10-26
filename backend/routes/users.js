import express from 'express';
import User from '../models/User.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { validatePhone, validatePasswordStrength } from '../utils/validators.js';

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

// PUT /api/users/me — the profile page saves name, phone and shipping
// address here. Email and role are deliberately not editable from this
// route, so a customer cannot promote themselves to admin or change the
// email their account is tied to.
router.put('/me', protect, async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    if (name !== undefined && !String(name).trim()) {
      return res.status(400).json({ message: 'Name cannot be empty.' });
    }
    if (phone !== undefined && !validatePhone(String(phone))) {
      return res.status(400).json({ message: 'Please enter a valid phone number.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found. Please log in again.' });

    if (name !== undefined) user.name = String(name).trim();
    if (phone !== undefined) user.phone = String(phone).trim();
    if (address && typeof address === 'object') {
      user.address = {
        street: String(address.street ?? '').trim(),
        city: String(address.city ?? '').trim(),
        postalCode: String(address.postalCode ?? '').trim(),
        country: String(address.country ?? '').trim(),
      };
    }

    await user.save();
    res.json({ user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/me/password — a logged-in customer changes their own
// password. The current password must be supplied, so someone who finds an
// unlocked browser cannot silently take over the account. (Forgotten
// passwords go through the email reset flow instead.)
router.put('/me/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required.' });
    }

    const strength = validatePasswordStrength(newPassword);
    if (!strength.valid) {
      return res.status(400).json({ message: strength.message });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found. Please log in again.' });

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({ message: 'New password must be different from the current one.' });
    }

    user.password = newPassword; // hashed by the User model's pre-save hook
    // Any reset link emailed earlier should stop working now.
    user.resetPasswordTokenHash = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: 'Password updated.' });
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

export default router;
