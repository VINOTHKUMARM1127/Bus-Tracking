import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User, USER_ROLES } from '../models/User.js';

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing token' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Missing token' });
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret || 'change_me');
    if (!decoded || typeof decoded !== 'object' || !decoded.userId) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid user' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const requireRole = (roles) => (req, res, next) => {
  const allowed = Array.isArray(roles) ? roles : [roles];
  if (!req.user || !allowed.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

export const ROLE = USER_ROLES;



