import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const hashPassword = async (plain) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
};

export const comparePassword = (plain, hash) => bcrypt.compare(plain, hash);

export const signToken = (user) => {
  const userId = user._id.toString();
  const secret = env.jwtSecret || 'change_me';
  const options = { expiresIn: env.jwtExpiresIn || '7d' };
  return jwt.sign({ userId, role: user.role }, secret, options);
};




