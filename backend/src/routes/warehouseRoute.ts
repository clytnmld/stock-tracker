import express from "express";
import prisma from "../prisma";
import { Warehouse } from "../models/warehouse";
import moment from "moment-timezone";
import { authorizedRoles } from "../middleware/jwtAuth";

const router = express.Router();

router.get("/all", authorizedRoles("owner", "manager"), async (req, res) => {
  try {
    const warehouse: Warehouse[] = await prisma.warehouse.findMany({});
    const formattedWarehouses = warehouse.map((wh) => ({
      ...wh,
      createdAt: moment(wh.createdAt)
        .tz("Asia/Jakarta")
        .format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment(wh.updatedAt)
        .tz("Asia/Jakarta")
        .format("YYYY-MM-DD HH:mm:ss"),
    }));
    res.json(formattedWarehouses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch warehouses" });
  }
});

router.get(
  "/all/active",
  authorizedRoles("owner", "manager"),
  async (req, res) => {
    try {
      const warehouse: Warehouse[] = await prisma.warehouse.findMany({
        where: { isDeleted: false },
      });
      const formattedWarehouses = warehouse.map((wh) => ({
        ...wh,
        createdAt: moment(wh.createdAt)
          .tz("Asia/Jakarta")
          .format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment(wh.updatedAt)
          .tz("Asia/Jakarta")
          .format("YYYY-MM-DD HH:mm:ss"),
      }));
      res.json(formattedWarehouses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch warehouses" });
    }
  },
);

router.get(
  "/all/deleted",
  authorizedRoles("owner", "manager"),
  async (req, res) => {
    try {
      const warehouse: Warehouse[] = await prisma.warehouse.findMany({
        where: { isDeleted: true },
      });
      const formattedWarehouses = warehouse.map((wh) => ({
        ...wh,
        createdAt: moment(wh.createdAt)
          .tz("Asia/Jakarta")
          .format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment(wh.updatedAt)
          .tz("Asia/Jakarta")
          .format("YYYY-MM-DD HH:mm:ss"),
      }));
      res.json(formattedWarehouses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch warehouses" });
    }
  },
);

router.get("/", authorizedRoles("owner", "manager"), async (req, res) => {
  const { id } = req.query;
  try {
    const warehouse: Warehouse | null = await prisma.warehouse.findUnique({
      where: { id: Number(id) },
    });
    if (!id) {
      return res.status(400).json({ error: "Warehouse id is required" });
    }
    const formattedWarehouse = warehouse
      ? [warehouse].map((wh) => ({
          ...wh,
          createdAt: moment(wh.createdAt)
            .tz("Asia/Jakarta")
            .format("YYYY-MM-DD HH:mm:ss"),
          updatedAt: moment(wh.updatedAt)
            .tz("Asia/Jakarta")
            .format("YYYY-MM-DD HH:mm:ss"),
        }))
      : null;
    res.json(formattedWarehouse);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch warehouse" });
  }
});

router.get("/:id", authorizedRoles("owner", "manager"), async (req, res) => {
  const { id } = req.params;
  try {
    const warehouse: Warehouse | null = await prisma.warehouse.findUnique({
      where: { id: Number(id) },
    });
    if (!warehouse) {
      return res.status(404).json({ error: "Warehouse not found" });
    }
    const formattedWarehouse = warehouse
      ? [warehouse].map((wh) => ({
          ...wh,
          createdAt: moment(wh.createdAt)
            .tz("Asia/Jakarta")
            .format("YYYY-MM-DD HH:mm:ss"),
          updatedAt: moment(wh.updatedAt)
            .tz("Asia/Jakarta")
            .format("YYYY-MM-DD HH:mm:ss"),
        }))
      : null;
    res.json(formattedWarehouse);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch warehouse" });
  }
});

router.get(
  "/:id/products",
  authorizedRoles("owner", "manager"),
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
            createdAt: moment(wh.createdAt)
              .tz("Asia/Jakarta")
              .format("YYYY-MM-DD HH:mm:ss"),
            updatedAt: moment(wh.updatedAt)
              .tz("Asia/Jakarta")
              .format("YYYY-MM-DD HH:mm:ss"),
          }))
        : null;
      res.json(formattedWarehouse);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products for warehouse" });
    }
  },
);

router.post("/", authorizedRoles("owner"), async (req, res) => {
  const { name } = req.body as Warehouse;
  try {
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }
    if (typeof name !== "string") {
      return res.status(400).json({ error: "Name must be a string" });
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
    res.status(500).json({ error: "Failed to create warehouse" });
  }
});

router.put("/:id", authorizedRoles("owner"), async (req, res) => {
  const { id } = req.params;
  const { name } = req.body as Warehouse;
  try {
    const warehouse: Warehouse | null = await prisma.warehouse.findUnique({
      where: { id: Number(id) },
    });
    if (!warehouse) {
      return res.status(404).json({ error: "Warehouse not found" });
    }
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }
    if (typeof name !== "string") {
      return res.status(400).json({ error: "Name must be a string" });
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
    res.status(500).json({ error: "Failed to update warehouse" });
  }
});

router.delete("/:id", authorizedRoles("owner"), async (req, res) => {
  const { id } = req.params;
  try {
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: Number(id) },
    });
    if (!warehouse) {
      return res.status(404).json({ error: "Warehouse not found" });
    }
    if (warehouse.totalStock > 0) {
      return res.status(400).json({
        error:
          "Cannot delete warehouse with existing stock please delete the product that still exist in this warehouse first",
      });
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
      createdAt: moment(deleteWarehouse.createdAt)
        .tz("Asia/Jakarta")
        .format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment(deleteWarehouse.updatedAt)
        .tz("Asia/Jakarta")
        .format("YYYY-MM-DD HH:mm:ss"),
    };
    res.json({
      message: "Warehouse deleted successfully",
      formattedDeleteWarehouse,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete warehouse" });
  }
});

export default router;
