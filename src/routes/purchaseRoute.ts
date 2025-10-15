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
    if (isNaN(valueNum) || valueNum <= 0) {
      return res.status(400).json({ error: 'value must be a positive number' });
    }
    if (isNaN(warehouseNum)) {
      return res.status(400).json({ error: 'warehouseId is required' });
    }

    const product = await prisma.products.findUnique({
      where: { id: Number(id) },
      include: { productStock: true }, // so we can locate existing relation(s)
    });

    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (product.isDeleted)
      return res.status(400).json({ error: 'Product has been deleted' });

    const transaction = await prisma.$transaction(async (tx) => {
      // find existing relation for this warehouse
      const existingRelation = await tx.productsWarehouse.findUnique({
        where: {
          productId_warehouseId: {
            productId: Number(id),
            warehouseId: warehouseNum,
          },
        },
      });

      if (existingRelation) {
        // update the product–warehouse stock
        const updatedRelation = await tx.productsWarehouse.update({
          where: {
            productId_warehouseId: {
              productId: Number(id),
              warehouseId: warehouseNum,
            },
          },
          data: {
            stock: existingRelation.stock + valueNum,
          },
        });

        const updatedWarehouse = await tx.warehouse.update({
          where: { id: warehouseNum },
          data: { totalStock: { increment: valueNum } },
        });

        return { updatedRelation, updatedWarehouse };
      } else {
        const createdRelation = await tx.productsWarehouse.create({
          data: {
            productId: Number(id),
            warehouseId: warehouseNum,
            stock: valueNum,
          },
        });

        const updatedWarehouse = await tx.warehouse.update({
          where: { id: warehouseNum },
          data: { totalStock: { increment: valueNum } },
        });

        return { createdRelation, updatedWarehouse };
      }
    });

    return res.json({ success: true, result: transaction });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to process purchase' });
  }
});

export default router;
