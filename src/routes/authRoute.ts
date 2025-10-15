import express from 'express';
import prisma from '../prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Register, Login } from '../models/auth';

const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body as Register;
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: 'Name, email, and password are required' });
  }
  try {
    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    if (typeof password !== 'string' || password.length < 6) {
      return res
        .status(400)
        .json({ error: 'Password must be at least 6 characters long' });
    }
    if (typeof name !== 'string' || name.trim().length === 0) {
      return res
        .status(400)
        .json({ error: 'Name should be a string and cannot be empty' });
    }
    if (typeof email !== 'string' || name.trim().length === 0) {
      return res
        .status(400)
        .json({ error: 'Email should be a string and cannot be empty' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.users.create({
      data: { name, email, password: hashedPassword },
    });
    res.status(201).json({
      success: 'Registration success can continue to login step',
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to register user' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body as Login;
  const secret = process.env.SECRET;

  if (!secret) {
    return res.status(500).json({ error: 'Secret key not configured' });
  }
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  try {
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      secret as string,
      { expiresIn: '10s' }
    );
    res.cookie('token', token, {
      httpOnly: true,
    });
    res.json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ error: 'Failed to login' });
  }
});

export default router;
