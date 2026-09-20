/**
 * One-off script to create (or promote) the first admin account.
 *
 * This is intentionally NOT an API route — admin creation must never be
 * reachable from the internet. Run it by hand, locally, against whichever
 * database you're targeting:
 *
 *   node scripts/createAdmin.js
 *
 * Reads credentials from environment variables (.env) so nothing is
 * hardcoded in source control:
 *
 *   ADMIN_NAME=Site Admin
 *   ADMIN_EMAIL=admin@kroma.com
 *   ADMIN_PASSWORD=SomeStrongP@ssw0rd
 *
 * Safe to re-run: if a user with that email already exists, it is
 * promoted to role "admin" instead of creating a duplicate account.
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import { validateEmail, validatePasswordStrength } from '../utils/validators.js';

dotenv.config();

async function createAdmin() {
  const name = process.env.ADMIN_NAME || 'Site Admin';
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error(
      'Missing ADMIN_EMAIL or ADMIN_PASSWORD in your .env file. Add both and re-run:\n' +
        '  ADMIN_EMAIL=admin@kroma.com\n' +
        '  ADMIN_PASSWORD=SomeStrongP@ssw0rd'
    );
    process.exit(1);
  }
  if (!validateEmail(email)) {
    console.error('ADMIN_EMAIL is not a valid email address.');
    process.exit(1);
  }
  const passwordCheck = validatePasswordStrength(password);
  if (!passwordCheck.valid) {
    console.error(`ADMIN_PASSWORD is too weak: ${passwordCheck.message}`);
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected.');

    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
      if (user.role === 'admin') {
        console.log(`"${normalizedEmail}" is already an admin. Nothing to do.`);
      } else {
        user.role = 'admin';
        await user.save();
        console.log(`Existing user "${normalizedEmail}" promoted to admin.`);
      }
    } else {
      // Passing the plain password lets the User model's pre('save') hook
      // hash it with bcrypt — same as normal registration, never stored in plain text.
      user = await User.create({
        name,
        email: normalizedEmail,
        password,
        role: 'admin',
      });
      console.log(`Admin account created for "${normalizedEmail}".`);
    }

    process.exit(0);
  } catch (err) {
    console.error('Failed to create admin:', err.message);
    process.exit(1);
  }
}

createAdmin();
