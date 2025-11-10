import request from 'supertest';
import { describe, it, expect, beforeEach } from 'vitest';
import app from '../../index';
import test from 'node:test';
import prisma from '../../prisma';

const roles = [
  { email: 'owner@example.com', password: '123456', role: 'owner' },
  { email: 'manager@example.com', password: '123456', role: 'manager' },
  { email: 'user@example.com', password: '123456', role: 'user' },
];

describe('Integration: Auth & Protected Routes', () => {
  roles.forEach(({ email, password, role }) => {
    let token: string;
    beforeEach(() => {
      // delete any existing test user before each test
      prisma.users.delete({
        where: { email: 'newEmailValid@example.com' },
      });
    });

    it('Should return error all fields required when user doesnt fill any field', async () => {
      const res = await request(app).post('/auth/register').send({
        name: '',
        email: '',
        password: '',
        role: '',
      });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty(
        'error',
        'Name, email, role, and password are required'
      );
    });
    it('Should return error for name when its only given an empty string', async () => {
      const res = await request(app).post('/auth/register').send({
        name: ' ',
        email: 'testing@gmail.com',
        password: '213123123',
        role: 'user',
      });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty(
        'error',
        'Name should be a string and cannot be empty'
      );
    });
    it('Should return error if user input an invalid email format', async () => {
      const res = await request(app).post('/auth/register').send({
        name: 'dt testing user',
        email: 'testing@.com',
        password: '213123123',
        role: 'user',
      });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Invalid email format');
    });
    it('Should return error if user input password with less than 6 characters', async () => {
      const res = await request(app).post('/auth/register').send({
        name: 'dt testing user',
        email: 'testing@example.com',
        password: '12345',
        role: 'user',
      });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty(
        'error',
        'Password must be at least 6 characters long'
      );
    });
    it('Should return error user role must be either oener, manager or user', async () => {
      const res = await request(app).post('/auth/register').send({
        name: 'dt testing user',
        email: 'testing@example.com',
        password: '123456',
        role: 'newRole',
      });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty(
        'error',
        'Role must be either an owner, manager or user'
      );
    });
    it('Should return error email already registered', async () => {
      const res = await request(app).post('/auth/register').send({
        name: 'dt testing user',
        email: 'user@example.com',
        password: '123456',
        role: 'user',
      });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Email already in use');
    });
    it('Should return succes registering an account', async () => {
      const res = await request(app).post('/auth/register').send({
        name: 'dt testing user',
        email: 'newEmailValid@example.com',
        password: '123456',
        role: role,
      });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty(
        'success',
        'Registration success can continue to login step'
      );
      expect(res.body).toHaveProperty('name', 'dt testing user');
      expect(res.body).toHaveProperty('email', 'newEmailValid@example.com');
      expect(res.body).toHaveProperty('role', role);
      await prisma.users.delete({
        where: { email: 'newEmailValid@example.com' },
      });
    });
    it('should log in and return a valid JWT token', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email, password });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      token = res.body.token;
    });

    it('should reject access to protected route without token', async () => {
      const res = await request(app).get('/warehouse');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'No token provided');
    });

    it('should access protected route with valid token /all', async () => {
      const res = await request(app)
        .get('/warehouse/all')
        .set('Authorization', `Bearer ${token}`);
      if (['owner', 'manager'].includes(role)) {
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
      } else {
        expect(res.status).toBe(403);
      }
    });
    it('should access protected route with valid token /all/active', async () => {
      const res = await request(app)
        .get('/warehouse/all/active')
        .set('Authorization', `Bearer ${token}`);
      if (['owner', 'manager'].includes(role)) {
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.every((wh: any) => wh.isDeleted)).toBe(false);
      } else {
        expect(res.status).toBe(403);
      }
    });
  });
});
