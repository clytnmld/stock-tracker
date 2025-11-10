import express from 'express';
import prisma from '../prisma';
import { Warehouse } from '../models/warehouse';
import moment from 'moment-timezone';
import { authorizedRoles } from '../middleware/jwtAuth';
import { formatDateToJakarta } from '../utils/dateFormat';
import {
  warehousePostValidation,
  warehousePutValidation,
  warehouseDeleteValidation,
} from '../utils/warehouseValidation';

const router = express.Router();

router.get('/all', authorizedRoles('owner', 'manager'), async (req, res) => {
  try {
    const warehouse: Warehouse[] = await prisma.warehouse.findMany({});
    const formattedWarehouses = warehouse.map((wh) => ({
      ...wh,
      createdAt: formatDateToJakarta(wh.createdAt),
      updatedAt: formatDateToJakarta(wh.updatedAt),
    }));
    res.json(formattedWarehouses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch warehouses' });
  }
});

router.get(
  '/all/active',
  authorizedRoles('owner', 'manager'),
  async (req, res) => {
    try {
      const warehouse: Warehouse[] = await prisma.warehouse.findMany({
        where: { isDeleted: false },
      });
      const formattedWarehouses = warehouse.map((wh) => ({
        ...wh,
        createdAt: formatDateToJakarta(wh.createdAt),
        updatedAt: formatDateToJakarta(wh.updatedAt),
      }));
      res.json(formattedWarehouses);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch warehouses' });
    }
  }
);

router.get(
  '/all/deleted',
  authorizedRoles('owner', 'manager'),
  async (req, res) => {
    try {
      const warehouse: Warehouse[] = await prisma.warehouse.findMany({
        where: { isDeleted: true },
      });
      const formattedWarehouses = warehouse.map((wh) => ({
        ...wh,
        createdAt: formatDateToJakarta(wh.createdAt),
        updatedAt: formatDateToJakarta(wh.updatedAt),
      }));
      res.json(formattedWarehouses);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch warehouses' });
    }
  }
);

router.get('/', authorizedRoles('owner', 'manager'), async (req, res) => {
  const { id } = req.query;
  try {
    const warehouse: Warehouse | null = await prisma.warehouse.findUnique({
      where: { id: Number(id) },
    });
    if (!id) {
      return res.status(400).json({ error: 'Warehouse id is required' });
    }
    const formattedWarehouse = warehouse
      ? [warehouse].map((wh) => ({
          ...wh,
          createdAt: formatDateToJakarta(wh.createdAt),
          updatedAt: formatDateToJakarta(wh.updatedAt),
        }))
      : null;
    res.json(formattedWarehouse);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch warehouse' });
  }
});

router.get('/:id', authorizedRoles('owner', 'manager'), async (req, res) => {
  const { id } = req.params;
  try {
    const warehouse: Warehouse | null = await prisma.warehouse.findUnique({
      where: { id: Number(id) },
    });
    if (!warehouse) {
      return res.status(404).json({ error: 'Warehouse not found' });
    }
    const formattedWarehouse = warehouse
      ? [warehouse].map((wh) => ({
          ...wh,
          createdAt: formatDateToJakarta(wh.createdAt),
          updatedAt: formatDateToJakarta(wh.updatedAt),
        }))
      : null;
    res.json(formattedWarehouse);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch warehouse' });
  }
});

router.get(
  '/:id/products',
  authorizedRoles('owner', 'manager'),
  async (req, res) => {
    const { id } = req.params;
    try {
      const warehouse: Warehouse | null = await prisma.warehouse.findUnique({
        where: { id: Number(id) },
        include: { productStocks: { include: { products: true } } },
      });
      const formattedWarehouse = warehouse
        ? [warehouse].map((wh) => ({
            ...wh,
            createdAt: formatDateToJakarta(wh.createdAt),
            updatedAt: formatDateToJakarta(wh.updatedAt),
          }))
        : null;
      res.json(formattedWarehouse);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch products for warehouse' });
    }
  }
);

router.post('/', authorizedRoles('owner'), async (req, res) => {
  const { name } = req.body as Warehouse;
  try {
    const error = warehousePostValidation(name);
    if (error) {
      return res.status(400).json({ error });
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

router.put('/:id', authorizedRoles('owner'), async (req, res) => {
  const { id } = req.params;
  const { name } = req.body as Warehouse;
  try {
    const warehouse: Warehouse | null = await prisma.warehouse.findUnique({
      where: { id: Number(id) },
    });
    const error = warehousePutValidation(name, warehouse);
    if (error) {
      return res.status(400).json({ error });
    }
    const updatedWarehouse = await prisma.warehouse.update({
      where: { id: Number(id) },
      data: {
        name,
        updatedAt: new Date(),
      },
    });
    res.json(updatedWarehouse);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update warehouse' });
  }
});

router.delete('/:id', authorizedRoles('owner'), async (req, res) => {
  const { id } = req.params;
  try {
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: Number(id) },
    });
    const error = warehouseDeleteValidation(warehouse);
    if (error) {
      return res.status(400).json({ error });
    }
    const deleteWarehouse = await prisma.warehouse.update({
      where: { id: Number(id) },
      data: {
        isDeleted: true,
        updatedAt: new Date(),
      },
    });
    const formattedDeleteWarehouse = {
      ...deleteWarehouse,
      createdAt: formatDateToJakarta(deleteWarehouse.createdAt),
      updatedAt: formatDateToJakarta(deleteWarehouse.updatedAt),
    };
    res.json({
      message: 'Warehouse deleted successfully',
      formattedDeleteWarehouse,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete warehouse' });
  }
});

export default router;
