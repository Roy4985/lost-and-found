import { Router } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/User.js';
import { signToken } from '../auth/token.js';
import { handleDbError } from '../utils/handleDbError.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// Reads the fields as plain text, whatever the client sent.
function readCredentials(body = {}) {
  return {
    name: String(body.name ?? '').trim(),
    email: String(body.email ?? '').trim().toLowerCase(),
    password: String(body.password ?? ''),
  };
}

// POST /api/auth/signup → create an account, return a token
router.post('/signup', async (req, res) => {
  const { name, email, password } = readCredentials(req.body);
  if (password.length < 8) {
    return res.status(400).json({ error: 'password must be at least 8 characters' });
  }
  try {
    if (await User.findOne({ email })) {
      return res.status(409).json({ error: 'That email is already registered' });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });
    res.status(201).json({ token: signToken(user), user });
  } catch (err) {
    handleDbError(err, res);
  }
});

// POST /api/auth/login → check the password, return a token
router.post('/login', async (req, res) => {
  const { email, password } = readCredentials(req.body);
  try {
    const user = await User.findOne({ email });
    const ok = user && (await bcrypt.compare(password, user.passwordHash));
    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    res.json({ token: signToken(user), user });
  } catch (err) {
    handleDbError(err, res);
  }
});

// GET /api/auth/me → the logged-in user (login required)
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    handleDbError(err, res);
  }
});

export default router;