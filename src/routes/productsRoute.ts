import express from 'express';
import prisma from '../prisma';
import moment from 'moment-timezone';
import { Product } from '../models/products';

const router = express.Router();

router.get('/all', async (req, res) => {
  try {
    const products = await prisma.products.findMany({});
    const formattedProducts = products.map((product) => ({
      ...product,
      createdAt: moment(product.createdAt)
        .tz('Asia/Jakarta')
        .format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: moment(product.updatedAt)
        .tz('Asia/Jakarta')
        .format('YYYY-MM-DD HH:mm:ss'),
    }));
    res.json(formattedProducts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/', async (req, res) => {
  const { id } = req.query;
  try {
    const product = await prisma.products.findUnique({
      where: { id: Number(id) },
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const product = await prisma.products.findUnique({
      where: { id: Number(id) },
    });
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

router.post('/', async (req, res) => {
  const { name, price, stock, warehouseId } = req.body as Product;
  const priceNum = Number(price);
  const stockNum = Number(stock);
  try {
    if (!name || price == null || stock == null) {
      return res
        .status(400)
        .json({ error: 'Name, price and stock are required' });
    }
    if (typeof name !== 'string') {
      return res.status(400).json({ error: 'Name need to be string' });
    }
    if (isNaN(priceNum)) {
      return res.status(403).json({ error: 'Price need to be number' });
    }
    if (isNaN(stockNum)) {
      return res.status(403).json({ error: 'stock need to be number' });
    }
    if (price < 0) {
      return res.status(400).json({ error: 'Price must be a positive number' });
    }
    if (stock < 0) {
      return res.status(400).json({ error: 'stock must be a positive number' });
    }
    const newProduct = await prisma.products.create({
      data: {
        name,
        price: priceNum,
        stock: stockNum,
        warehouse: {
          create: {
            warehouse: {
              connect: { id: warehouseId },
            },
          },
        },
      },
    });
    await prisma.warehouse.update({
      where: { id: warehouseId },
      data: {
        totalStock: {
          increment: stockNum,
        },
      },
    });
    const formattedProduct = {
      ...newProduct,
      createdAt: moment(newProduct.createdAt)
        .tz('Asia/Jakarta')
        .format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: moment(newProduct.updatedAt)
        .tz('Asia/Jakarta')
        .format('YYYY-MM-DD HH:mm:ss'),
    };
    res.status(201).json(formattedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

export default router;
