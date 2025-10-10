import express from 'express';
import prisma from '../prisma';
import { Warehouse } from '../models/warehouse';
import moment from 'moment-timezone';

const router = express.Router();

router.get('/all', async (req, res) => {
  try {
    const warehouse: Warehouse[] = await prisma.warehouse.findMany({});
    const formattedWarehouses = warehouse.map((wh) => ({
      ...wh,
      createdAt: moment(wh.createdAt)
        .tz('Asia/Jakarta')
        .format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: moment(wh.updatedAt)
        .tz('Asia/Jakarta')
        .format('YYYY-MM-DD HH:mm:ss'),
    }));
    res.json(formattedWarehouses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch warehouses' });
  }
});

router.get('/', async (req, res) => {
  const { id } = req.query;
  try {
    const warehouse: Warehouse | null = await prisma.warehouse.findUnique({
      where: { id: Number(id) },
    });
    const formattedWarehouse = warehouse
      ? [warehouse].map((wh) => ({
          ...wh,
          createdAt: moment(wh.createdAt)
            .tz('Asia/Jakarta')
            .format('YYYY-MM-DD HH:mm:ss'),
          updatedAt: moment(wh.updatedAt)
            .tz('Asia/Jakarta')
            .format('YYYY-MM-DD HH:mm:ss'),
        }))
      : null;
    res.json(formattedWarehouse);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch warehouse' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const warehouse: Warehouse | null = await prisma.warehouse.findUnique({
      where: { id: Number(id) },
    });
    const formattedWarehouse = warehouse
      ? [warehouse].map((wh) => ({
          ...wh,
          createdAt: moment(wh.createdAt)
            .tz('Asia/Jakarta')
            .format('YYYY-MM-DD HH:mm:ss'),
          updatedAt: moment(wh.updatedAt)
            .tz('Asia/Jakarta')
            .format('YYYY-MM-DD HH:mm:ss'),
        }))
      : null;
    res.json(formattedWarehouse);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch warehouse' });
  }
});

router.get('/:id/products', async (req, res) => {
  const { id } = req.params;
  try {
    const warehouse: Warehouse | null = await prisma.warehouse.findUnique({
      where: { id: Number(id) },
      include: { product: true },
    });
    const formattedWarehouse = warehouse
      ? [warehouse].map((wh) => ({
          ...wh,
          createdAt: moment(wh.createdAt)
            .tz('Asia/Jakarta')
            .format('YYYY-MM-DD HH:mm:ss'),
          updatedAt: moment(wh.updatedAt)
            .tz('Asia/Jakarta')
            .format('YYYY-MM-DD HH:mm:ss'),
        }))
      : null;
    res.json(formattedWarehouse);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products for warehouse' });
  }
});

router.post('/', async (req, res) => {
  const { name } = req.body as Warehouse;
  try {
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (typeof name !== 'string') {
      return res.status(400).json({ error: 'Name must be a string' });
    }
    const newWarehouse: Warehouse = await prisma.warehouse.create({
      data: {
        name,
        totalStock: 0,
        isDeleted: false,
      },
    });
    res.status(201).json(newWarehouse);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create warehouse' });
  }
});

export default router;
