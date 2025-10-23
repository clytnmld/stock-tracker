import express from "express";
import prisma from "../prisma";
import moment from "moment-timezone";
import { Product } from "../models/products";
import { Prisma } from "@prisma/client";
import { authorizedRoles } from "../middleware/jwtAuth";

const router = express.Router();

router.get("/all", authorizedRoles("owner", "manager"), async (req, res) => {
  try {
    const products = await prisma.products.findMany({
      include: {
        productStock: { include: { warehouse: true } },
      },
    });
    const formattedProducts = products.map((product) => ({
      ...product,
      createdAt: moment(product.createdAt)
        .tz("Asia/Jakarta")
        .format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment(product.updatedAt)
        .tz("Asia/Jakarta")
        .format("YYYY-MM-DD HH:mm:ss"),
    }));
    res.json(formattedProducts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.get("/", authorizedRoles("owner", "manager"), async (req, res) => {
  const { id } = req.query;
  try {
    const product = await prisma.products.findUnique({
      where: { id: Number(id) },
    });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    const formattedProduct = {
      ...product,
      createdAt: moment(product.createdAt)
        .tz("Asia/Jakarta")
        .format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment(product.updatedAt)
        .tz("Asia/Jakarta")
        .format("YYYY-MM-DD HH:mm:ss"),
    };
    res.json(formattedProduct);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.get("/:id", authorizedRoles("owner", "manager"), async (req, res) => {
  const { id } = req.params;
  try {
    const product = await prisma.products.findUnique({
      where: { id: Number(id) },
      include: {
        productStock: { include: { warehouse: true } },
      },
    });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    const formattedProduct = {
      ...product,
      createdAt: moment(product.createdAt)
        .tz("Asia/Jakarta")
        .format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment(product.updatedAt)
        .tz("Asia/Jakarta")
        .format("YYYY-MM-DD HH:mm:ss"),
    };
    res.json(formattedProduct);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

router.post("/", authorizedRoles("owner", "manager"), async (req, res) => {
  const { name, price, warehouses } = req.body as Product;
  const priceNum = Number(price);
  try {
    if (!name || price == null) {
      return res
        .status(400)
        .json({ error: "Name, price and stock are required" });
    }
    if (typeof name !== "string") {
      return res.status(400).json({ error: "Name need to be string" });
    }
    if (isNaN(priceNum)) {
      return res.status(403).json({ error: "Price need to be number" });
    }
    if (priceNum < 0) {
      return res.status(400).json({ error: "Price must be a positive number" });
    }
    if (warehouses && warehouses.length > 0) {
      for (const { warehouseId, stock } of warehouses) {
        const warehouseNum = Number(warehouseId);
        const warehouse = await prisma.warehouse.findUnique({
          where: { id: warehouseNum },
        });
        if (!warehouse) {
          return res
            .status(404)
            .json({ error: `Warehouse with ID ${warehouseNum} not found` });
        }
        if (warehouse.isDeleted) {
          return res.status(404).json({
            error: `Warehouse with ID ${warehouseNum} is no longer available`,
          });
        }
        const stockNum = Number(stock);
        if (isNaN(stockNum) || stockNum < 0) {
          return res
            .status(403)
            .json({ error: "Stock need to be a positive number" });
        }
      }
    }
    const createdProduct = await prisma.$transaction(async (tx) => {
      const productStockCreate =
        warehouses && warehouses.length > 0
          ? warehouses.map((w) => ({
              stock: Number(w.stock),
              warehouse: { connect: { id: Number(w.warehouseId) } },
            }))
          : undefined;

      const productData: Prisma.ProductsCreateInput = {
        name,
        price: priceNum,
        ...(productStockCreate
          ? { productStock: { create: productStockCreate } }
          : {}),
      };

      const newProduct = await tx.products.create({
        data: productData,
        include: {
          productStock: true,
        },
      });

      if (warehouses && warehouses.length > 0) {
        for (const { warehouseId, stock } of warehouses) {
          await tx.warehouse.update({
            where: { id: Number(warehouseId) },
            data: {
              totalStock: {
                increment: Number(stock),
              },
            },
          });
        }
      }

      return newProduct;
    });
    const formattedProduct = {
      ...createdProduct,
      createdAt: moment(createdProduct.createdAt)
        .tz("Asia/Jakarta")
        .format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment(createdProduct.updatedAt)
        .tz("Asia/Jakarta")
        .format("YYYY-MM-DD HH:mm:ss"),
    };
    res.status(201).json(formattedProduct);
  } catch (error) {
    res.status(500).json({ error: "Failed to create product" });
  }
});

router.put("/:id", authorizedRoles("owner", "manager"), async (req, res) => {
  const { id } = req.params;
  const { name, price, warehouses } = req.body;
  const priceNum = Number(price);

  try {
    const existingProduct = await prisma.products.findUnique({
      where: { id: Number(id) },
      include: {
        productStock: true,
      },
    });

    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (!name || price == null || !Array.isArray(warehouses)) {
      return res.status(400).json({
        error: "Name, price, and warehouses array are required",
      });
    }

    const transaction = await prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.products.update({
        where: { id: Number(id) },
        data: { name, price: priceNum },
      });

      const currentRelations = existingProduct.productStock;

      const newWarehouseIds = warehouses.map((w) => Number(w.warehouseId));

      const removedRelations = currentRelations.filter(
        (r) => !newWarehouseIds.includes(r.warehouseId),
      );

      for (const removed of removedRelations) {
        await tx.warehouse.update({
          where: { id: removed.warehouseId },
          data: {
            totalStock: { decrement: removed.stock },
          },
        });

        await tx.productsWarehouse.delete({
          where: {
            productId_warehouseId: {
              productId: updatedProduct.id,
              warehouseId: removed.warehouseId,
            },
          },
        });
      }

      for (const w of warehouses) {
        const warehouseNum = Number(w.warehouseId);
        const stockNum = Number(w.stock);

        const targetWarehouse = await tx.warehouse.findUnique({
          where: { id: warehouseNum },
        });

        if (!targetWarehouse || targetWarehouse.isDeleted)
          throw new Error(`Warehouse ${warehouseNum} not available`);

        const existingRelation = currentRelations.find(
          (r) => r.warehouseId === warehouseNum,
        );

        let stockDifference = 0;

        if (existingRelation) {
          stockDifference = stockNum - existingRelation.stock;
          await tx.productsWarehouse.update({
            where: {
              productId_warehouseId: {
                productId: updatedProduct.id,
                warehouseId: warehouseNum,
              },
            },
            data: { stock: stockNum },
          });
        } else {
          stockDifference = stockNum;
          await tx.productsWarehouse.create({
            data: {
              productId: updatedProduct.id,
              warehouseId: warehouseNum,
              stock: stockNum,
            },
          });
        }

        await tx.warehouse.update({
          where: { id: warehouseNum },
          data: {
            totalStock: { increment: stockDifference },
          },
        });
      }

      const finalProduct = await tx.products.findUnique({
        where: { id: updatedProduct.id },
        include: { productStock: { include: { warehouse: true } } },
      });

      return finalProduct;
    });
    if (!transaction) {
      return res
        .status(500)
        .json({ error: "Unexpected empty transaction result" });
    }

    const formattedProduct = {
      ...transaction,
      createdAt: moment(transaction.createdAt)
        .tz("Asia/Jakarta")
        .format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment(transaction.updatedAt)
        .tz("Asia/Jakarta")
        .format("YYYY-MM-DD HH:mm:ss"),
    };

    res.json(formattedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update product" });
  }
});

router.delete("/:id", authorizedRoles("owner"), async (req, res) => {
  const { id } = req.params;

  try {
    const existingProduct = await prisma.products.findUnique({
      where: { id: Number(id) },
      include: { productStock: true },
    });

    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (existingProduct.isDeleted) {
      return res
        .status(400)
        .json({ error: "Product has already been deleted" });
    }

    const transaction = await prisma.$transaction(async (tx) => {
      const deletedProduct = await tx.products.update({
        where: { id: Number(id) },
        data: { isDeleted: true },
      });

      for (const relation of existingProduct.productStock) {
        await tx.warehouse.update({
          where: { id: relation.warehouseId },
          data: {
            totalStock: {
              decrement: relation.stock,
            },
          },
        });
      }
      return deletedProduct;
    });

    const formattedProduct = {
      ...transaction,
      createdAt: moment(transaction.createdAt)
        .tz("Asia/Jakarta")
        .format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment(transaction.updatedAt)
        .tz("Asia/Jakarta")
        .format("YYYY-MM-DD HH:mm:ss"),
    };

    res.json({
      product: formattedProduct,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
