import express from 'express';
import prisma from '../prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Register, Login } from '../models/auth';
import { registerPostValidation } from '../utils/authValidation';
import { LoginValidator } from '../utils/authValidation';

const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body as Register;
  if (!name || !email || !password || !role) {
    return res
      .status(400)
      .json({ error: 'Name, email, role, and password are required' });
  }
  try {
    const existingUser = await prisma.users.findUnique({ where: { email } });
    const error = registerPostValidation(
      existingUser,
      email,
      password,
      name,
      role
    );
    if (error) {
      return res.status(400).json({ error });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.users.create({
      data: { name, email, password: hashedPassword, role },
    });
    res.status(201).json({
      success: 'Registration success can continue to login step',
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to register user' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body as Login;
  const secret = process.env.SECRET;

  const error = LoginValidator.validateInput(email, password);
  if (error) {
    return res.status(400).json({ error });
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
      { id: user.id, email: user.email, name: user.name, role: user.role },
      secret as string,
      { expiresIn: '1d' }
    );
    res.json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ error: 'Failed to login' });
  }
});

export default router;
