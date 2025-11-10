import express from 'express';
import prisma from '../prisma';
import moment from 'moment-timezone';
import { Product } from '../models/products';
import { authorizedRoles } from '../middleware/jwtAuth';
import { formatDateToJakarta } from '../utils/dateFormat';
import { purchasePostValidation } from '../utils/purchaseValidation';

const router = express.Router();

router.put(
  '/:id',
  authorizedRoles('owner', 'manager', 'user'),
  async (req, res) => {
    const { id } = req.params;
    const { value, warehouseId } = req.body;
    const valueNum = Number(value);
    const warehouseNum = Number(warehouseId);

    try {
      const product = await prisma.products.findUnique({
        where: { id: Number(id) },
        include: { productStock: true },
      });

      const error = purchasePostValidation(valueNum, warehouseNum, product);
      if (error) return res.status(400).json({ error });

      const transaction = await prisma.$transaction(async (tx) => {
        const existingRelation = await tx.productsWarehouse.findUnique({
          where: {
            productId_warehouseId: {
              productId: Number(id),
              warehouseId: warehouseNum,
            },
          },
        });

        if (existingRelation) {
          await tx.productsWarehouse.update({
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

          await tx.warehouse.update({
            where: { id: warehouseNum },
            data: { totalStock: { increment: valueNum } },
          });
        } else {
          await tx.productsWarehouse.create({
            data: {
              productId: Number(id),
              warehouseId: warehouseNum,
              stock: valueNum,
            },
          });

          await tx.warehouse.update({
            where: { id: warehouseNum },
            data: { totalStock: { increment: valueNum } },
          });
        }
        const createStockMovements = await tx.stockMovements.create({
          data: {
            productId: Number(id),
            warehouseId: warehouseNum,
            type: 'Purchase',
            amount: valueNum,
          },
          include: { products: true, warehouse: true },
        });
        return createStockMovements;
      });
      const formattedTransaction = {
        ...transaction,
        createdAt: formatDateToJakarta(transaction.createdAt),
        updatedAt: formatDateToJakarta(transaction.updatedAt),
      };
      res.json({
        message: 'Purchase done successfully',
        purchase: formattedTransaction,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to process purchase' });
    }
  }
);

export default router;
