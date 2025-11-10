import request from 'supertest';
import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
} from 'vitest';
import app from '../../index';
import test, { after } from 'node:test';
import prisma from '../../prisma';

const roles = [
  { email: 'owner@example.com', password: '123456', role: 'owner' },
  { email: 'manager@example.com', password: '123456', role: 'manager' },
  { email: 'user@example.com', password: '123456', role: 'user' },
];

for (const { email, password, role } of roles) {
  describe(`Integration: Product Management ${role}`, () => {
    let token: string;
    let warehouseId: number;
    let productId: number;
    beforeAll(async () => {
      const testDataWarehouse = await prisma.warehouse.create({
        data: {
          name: 'Product Test Warehouse',
          totalStock: 0,
          isDeleted: false,
        },
      });
      warehouseId = testDataWarehouse.id;
    });

    it('Do Login', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email, password });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      token = res.body.token;
    });
    it(`Should fetch products list for all products -- ${role}`, async () => {
      const res = await request(app)
        .get('/products/all')
        .set({ authorization: `Bearer ${token}` });

      if (role === 'user') {
        expect(res.status).toBe(403);
        return;
      }
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
    it(`Should fetch products list with only active products -- ${role}`, async () => {
      const res = await request(app)
        .get('/products/all/active')
        .set({ authorization: `Bearer ${token}` });

      if (role === 'user') {
        expect(res.status).toBe(403);
        return;
      }
      expect(res.status).toBe(200);
      expect(res.body.every((p: any) => p.isDeleted)).toBe(false);
    });
    it(`Should fetch products list with only deleted products -- ${role}`, async () => {
      const res = await request(app)
        .get('/products/all/deleted')
        .set({ authorization: `Bearer ${token}` });

      if (role === 'user') {
        expect(res.status).toBe(403);
        return;
      }
      expect(res.status).toBe(200);
      expect(res.body.every((p: any) => p.isDeleted)).toBe(true);
    });
    it('Should create a new product', async () => {
      const res = await request(app)
        .post('/products')
        .set({ authorization: `Bearer ${token}` })
        .send({
          name: 'Integration Test Product',
          price: '100000',
          warehouses: [
            {
              warehouseId: warehouseId,
              stock: '100',
            },
          ],
        });
      if (role !== 'owner' && role !== 'manager') {
        expect(res.status).toBe(403);
        return;
      }
      productId = res.body.id;
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('name', 'Integration Test Product');
      expect(res.body).toHaveProperty('price', 100000);
      expect(res.body.productStock[0]).toMatchObject({
        productId: productId,
        warehouseId: warehouseId,
        stock: 100,
      });
    });

    it('Should update the new created product', async () => {
      const res = await request(app)
        .put(`/products/${productId}`)
        .set({ authorization: `Bearer ${token}` })
        .send({
          name: 'Integration Test Product Updated',
          price: 150000,
          warehouses: [
            {
              warehouseId: warehouseId,
              stock: '150',
            },
          ],
        });
      if (role !== 'owner' && role !== 'manager') {
        expect(res.status).toBe(403);
        return;
      }
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', productId);
      expect(res.body).toHaveProperty(
        'name',
        'Integration Test Product Updated'
      );
      expect(res.body).toHaveProperty('price', 150000);
      expect(res.body.productStock[0]).toMatchObject({
        productId: productId,
        warehouseId: warehouseId,
        stock: 150,
      });
    });
    it('Should soft delete the newly created product', async () => {
      const res = await request(app)
        .delete(`/products/${productId}`)
        .set({ authorization: `Bearer ${token}` });

      if (role !== 'owner') {
        expect(res.status).toBe(403);
        return;
      }

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty(
        'message',
        'Product deleted successfully'
      );
      expect(res.body.product.isDeleted).toBe(true);
    });

    afterAll(async () => {
      await prisma.productsWarehouse.deleteMany({
        where: {
          warehouseId: warehouseId,
        },
      });

      await prisma.products.deleteMany({
        where: { name: 'Integration Test Product' },
      });

      await prisma.warehouse.deleteMany({
        where: { name: 'Product Test Warehouse' },
      });
    });
  });
}
