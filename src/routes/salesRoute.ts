import express from 'express';
import prisma from '../prisma';
import moment from 'moment-timezone';
import { Product } from '../models/products';

const router = express.Router();

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { value, warehouseId } = req.body;
  const valueNum = Number(value);
  const warehouseNum = Number(warehouseId);
  try {
    const product = await prisma.products.findUnique({
      where: { id: Number(id) },
      include: { productStock: true },
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    if (!warehouseNum) {
      return res.status(400).json({ error: 'warehouseId is required' });
    }
    const relation = product.productStock.find(
      (rel) => rel.warehouseId === warehouseNum
    );
    if (!relation) {
      return res.status(404).json({ error: 'Warehouse relation not found' });
    }
    if (relation.stock < valueNum) {
      return res.status(400).json({ error: 'Stock not enough to do sales' });
    }
    if (valueNum < 0) {
      return res.status(400).json({ error: 'value must be a positive number' });
    }
    if (product.isDeleted) {
      return res.status(400).json({ error: 'Pruduct has been deleted' });
    }
    const transaction = await prisma.$transaction(async (tx) => {
      await tx.productsWarehouse.update({
        where: {
          productId_warehouseId: {
            productId: Number(id),
            warehouseId: warehouseNum,
          },
        },
        data: {
          stock: relation.stock - valueNum,
        },
      });
      await tx.warehouse.update({
        where: { id: warehouseNum },
        data: { totalStock: { decrement: valueNum } },
      });
      const createStockMovements = await tx.stockMovements.create({
        data: {
          productId: Number(id),
          warehouseId: warehouseNum,
          type: 'Sales',
          amount: valueNum,
        },
        include: { products: true, warehouse: true },
      });
      return createStockMovements;
    });
    const formattedTransaction = {
      ...transaction,
      createdAt: moment(transaction.createdAt)
        .tz('Asia/Jakarta')
        .format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: moment(transaction.updatedAt)
        .tz('Asia/Jakarta')
        .format('YYYY-MM-DD HH:mm:ss'),
    };
    res.json({
      message: 'Sales done successfully',
      sales: formattedTransaction,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process sales' });
  }
});

export default router;
