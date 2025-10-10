import express from 'express';
import prisma from '../prisma';
import moment from 'moment-timezone';
import { Product } from '../models/products';

const router = express.Router();

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { value } = req.body;
  const valueNum = Number(value);
  try {
    const product: Product | null = await prisma.products.findUnique({
      where: { id: Number(id) },
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const result = product.stock + valueNum;
    const updatedProduct = await prisma.products.update({
      where: { id: Number(id) },
      data: {
        stock: result,
        updatedAt: new Date(),
      },
    });
    const updateWarehouse = await prisma.warehouse.update({
      where: { id: product.warehouseId },
      data: {
        totalStock: {
          increment: valueNum,
        },
      },
    });
    const formattedProduct = {
      ...updatedProduct,
      createdAt: moment(updatedProduct.createdAt)
        .tz('Asia/Jakarta')
        .format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: moment(updatedProduct.updatedAt)
        .tz('Asia/Jakarta')
        .format('YYYY-MM-DD HH:mm:ss'),
    };
    res.json({ product: formattedProduct, warehouse: updateWarehouse });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

export default router;
