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
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const formattedProduct = {
      ...product,
      createdAt: moment(product.createdAt)
        .tz('Asia/Jakarta')
        .format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: moment(product.updatedAt)
        .tz('Asia/Jakarta')
        .format('YYYY-MM-DD HH:mm:ss'),
    };
    res.json(formattedProduct);
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
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const formattedProduct = {
      ...product,
      createdAt: moment(product.createdAt)
        .tz('Asia/Jakarta')
        .format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: moment(product.updatedAt)
        .tz('Asia/Jakarta')
        .format('YYYY-MM-DD HH:mm:ss'),
    };
    res.json(formattedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

router.post('/', async (req, res) => {
  const { name, price, stock, warehouseId } = req.body as Product;
  const priceNum = Number(price);
  const stockNum = Number(stock);
  const warehouseNum = Number(warehouseId);
  try {
    if (!name || price == null || stock == null || !warehouseId) {
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
    if (priceNum < 0) {
      return res.status(400).json({ error: 'Price must be a positive number' });
    }
    if (stockNum < 0) {
      return res.status(400).json({ error: 'stock must be a positive number' });
    }
    const newProduct = await prisma.products.create({
      data: {
        name,
        price: priceNum,
        stock: stockNum,
        warehouseId: warehouseNum,
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

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price, stock, warehouseId } = req.body as Product;
  const priceNum = Number(price);
  const stockNum = Number(stock);
  const warehouseNum = Number(warehouseId);
  try {
    const existingProduct = await prisma.products.findUnique({
      where: { id: Number(id) },
    });
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    if (!name || price == null || stock == null || !warehouseNum) {
      return res
        .status(400)
        .json({ error: 'Name, price, stock and warehouseId are required' });
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
    if (priceNum < 0) {
      return res.status(400).json({ error: 'Price must be a positive number' });
    }
    if (stockNum < 0) {
      return res.status(400).json({ error: 'stock must be a positive number' });
    }
    const updatedProduct = await prisma.products.update({
      where: { id: Number(id) },
      data: {
        name: name,
        price: priceNum,
        stock: stockNum,
        warehouseId: warehouseNum,
      },
    });
    if (warehouseNum !== existingProduct.warehouseId) {
      await prisma.warehouse.update({
        where: { id: existingProduct.warehouseId },
        data: {
          totalStock: {
            decrement: existingProduct.stock,
          },
        },
      });
      await prisma.warehouse.update({
        where: { id: warehouseNum },
        data: {
          totalStock: {
            increment: stockNum,
          },
        },
      });
    }
    if (stockNum > existingProduct.stock) {
      const stockDifference = stockNum - existingProduct.stock;
      await prisma.warehouse.update({
        where: { id: warehouseNum },
        data: {
          totalStock: {
            increment: stockDifference,
          },
        },
      });
    } else if (stockNum < existingProduct.stock) {
      const stockDifference = existingProduct.stock - stockNum;
      await prisma.warehouse.update({
        where: { id: warehouseNum },
        data: {
          totalStock: {
            decrement: stockDifference,
          },
        },
      });
    }
    const formattedProduct = {
      ...updatedProduct,
      createdAt: moment(updatedProduct.createdAt)
        .tz('Asia/Jakarta')
        .format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: moment(updatedProduct.updatedAt)
        .tz('Asia/Jakarta')
        .format('YYYY-MM-DD HH:mm:ss'),
    };
    res.json(formattedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

export default router;
