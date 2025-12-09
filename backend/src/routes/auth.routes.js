import { Router } from 'express';
import { comparePassword, hashPassword, signToken } from '../utils/auth.js';
import { User, USER_ROLES } from '../models/User.js';
import { env } from '../config/env.js';

const router = Router();

// bootstrap admin if missing
const ensureAdmin = async () => {
  const existing = await User.findOne({ role: USER_ROLES.admin });
  if (existing) return existing;
  const passwordHash = await hashPassword(env.adminDefaultPass);
  return User.create({
    username: env.adminDefaultUser,
    passwordHash,
    role: USER_ROLES.admin
  });
};
ensureAdmin().catch((err) => console.error('Admin bootstrap failed', err));

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = signToken(user);
  return res.json({
    token,
    user: {
      id: user._id.toString(),
      username: user.username,
      role: user.role,
      busNumber: user.busNumber
    }
  });
});

export default router;


