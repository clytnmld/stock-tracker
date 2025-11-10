import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../../index';
import prisma from '../../prisma';

const roles = [
  { email: 'owner@example.com', password: '123456', role: 'owner' },
  { email: 'manager@example.com', password: '123456', role: 'manager' },
  { email: 'user@example.com', password: '123456', role: 'user' },
];

for (const { email, password, role } of roles) {
  describe(`Warehouse Management Test ${role}`, () => {
    let token: string;
    let createdWarehouseId: number;
    it('Do Login', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email, password });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      token = res.body.token;
      createdWarehouseId = 0;
    });
    it('Should create a warehouse POST', async () => {
      const res = await request(app)
        .post('/warehouse')
        .set({ authorization: `Bearer ${token}` })
        .send({ name: 'Integration Test Warehouse' });

      if (role !== 'owner') {
        expect(res.status).toBe(403);
        return;
      }
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('name', 'Integration Test Warehouse');
      createdWarehouseId = res.body.id;
    });

    it('Should update warehouse name', async () => {
      const res = await request(app)
        .put(`/warehouse/${createdWarehouseId}`)
        .set({ authorization: `Bearer ${token}` })
        .send({ name: 'Updated Warehouse Name' });

      if (role !== 'owner') {
        expect(res.status).toBe(403);
        return;
      }
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', 'Updated Warehouse Name');
    });

    it('Should soft delete the warehouse', async () => {
      const res = await request(app)
        .delete(`/warehouse/${createdWarehouseId}`)
        .set({ authorization: `Bearer ${token}` });

      if (role !== 'owner') {
        expect(res.status).toBe(403);
        return;
      }
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty(
        'message',
        'Warehouse deleted successfully'
      );
      expect(res.body.formattedDeleteWarehouse.isDeleted).toBe(true);
    });

    it('Get all warehouses', async () => {
      const res = await request(app)
        .get('/warehouse/all')
        .set({
          authorization: `Bearer ${token}`,
        });
      if (['owner', 'manager'].includes(role)) {
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(0);
      } else {
        expect(res.status).toBe(403);
      }
    });
    it('Get specific warehouses', async () => {
      const res = await request(app)
        .get(`/warehouse/${createdWarehouseId}`)
        .set({
          authorization: `Bearer ${token}`,
        });
      if (role === 'owner') {
        expect(res.status).toBe(200);
        expect(res.body[0]).toHaveProperty('name', `Updated Warehouse Name`);
        expect(res.body[0]).toHaveProperty('totalStock', 0);
        expect(res.body[0]).toHaveProperty('isDeleted', true);
      } else {
        expect([403, 404]).toContain(res.status);
      }
    });

    it('delete if any', async () => {
      if (createdWarehouseId) {
        await prisma.warehouse.deleteMany({
          where: { id: createdWarehouseId },
        });
      }
    });
  });
}
