import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import app from '../../index';
import prisma from '../../prisma';

const roles = [
  { email: 'owner@example.com', password: '123456', role: 'owner' },
  { email: 'manager@example.com', password: '123456', role: 'manager' },
  { email: 'user@example.com', password: '123456', role: 'user' },
];

for (const { email, password, role } of roles) {
  describe(`Integration: Purchase Management ${role}`, () => {
    let token: string;
    let warehouseId: number;
    let productId: number;
    beforeAll(async () => {
      const warehouse = await prisma.warehouse.create({
        data: {
          name: 'Purchase Test Warehouse',
          totalStock: 50,
          isDeleted: false,
        },
      });

      // create product with proper relation
      const product = await prisma.products.create({
        data: {
          name: 'Purchase Test Product',
          price: 1000,
          isDeleted: false,
          productStock: {
            create: [
              {
                warehouseId: warehouse.id,
                stock: 50,
              },
            ],
          },
        },
        include: { productStock: true },
      });

      // Save IDs for test
      warehouseId = warehouse.id;
      productId = product.id;

      console.log('Created warehouse:', warehouse.id);
      console.log('Created product:', product.id);
    });

    it('Do Login', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email, password });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      token = res.body.token;
    });

    it(`Should create a purchase record -- ${role}`, async () => {
      const res = await request(app)
        .put(`/purchase/${productId}`)
        .set({ authorization: `Bearer ${token}` })
        .send({
          value: 5,
          warehouseId: warehouseId,
        });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Purchase done successfully');
      expect(res.body).toHaveProperty('purchase');
      expect(res.body.purchase).toHaveProperty('id');
      expect(res.body.purchase).toHaveProperty('type', 'Purchase');
      expect(res.body.purchase).toHaveProperty('amount', 5);
      expect(res.body.purchase).toHaveProperty('productId', productId);
      expect(res.body.purchase).toHaveProperty('warehouseId', warehouseId);
      expect(res.body.purchase.products).toHaveProperty(
        'name',
        'Purchase Test Product'
      );
      expect(res.body.purchase.warehouse).toHaveProperty('totalStock', 55);
    });
    afterAll(async () => {
      await prisma.stockMovements.deleteMany({
        where: {
          warehouseId: warehouseId,
        },
      });
      await prisma.productsWarehouse.deleteMany({
        where: {
          warehouseId: warehouseId,
        },
      });
      await prisma.products.deleteMany({
        where: { name: 'Purchase Test Product' },
      });

      await prisma.warehouse.deleteMany({
        where: { name: 'Purchase Test Warehouse' },
      });
    });
  });
}
