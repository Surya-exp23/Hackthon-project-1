import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';

// Register User
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ error: { code: 'CONFLICT', message: 'Email already exists' } });
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    passwordHash,
    role: role || 'citizen',
  });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '7d',
  });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  const userResponse = { id: user._id, name: user.name, email: user.email, role: user.role };

  res.status(201).json({ user: userResponse, token });
});

// Login User
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' } });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' } });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '7d',
  });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  const userResponse = { id: user._id, name: user.name, email: user.email, role: user.role };

  res.status(200).json({ user: userResponse, token });
});

// Logout User
export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ success: true });
});

// Get Current User
export const getMe = asyncHandler(async (req: any, res: Response) => {
  const user = await User.findById(req.user.id).select('-passwordHash');
  res.status(200).json({ user });
});
