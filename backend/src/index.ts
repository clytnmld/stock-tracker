import express from "express";
import warehouseRoute from "./routes/warehouseRoute";
import productsRoute from "./routes/productsRoute";
import salesRoute from "./routes/salesRoute";
import purchaseRoute from "./routes/purchaseRoute";
import authRoute from "./routes/authRoute";
import { jwtAuth, authorizedRoles } from "./middleware/jwtAuth";
import cors from "cors";

const app = express();
const port = 3000;

app.use(express.json());
app.use(
  cors({
    origin: `http://localhost:5173`,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
app.get("/", (req, res) => {
  res.send("Hello, World!");
});
app.use(
  "/warehouse",
  jwtAuth,
  authorizedRoles("owner", "manager"),
  warehouseRoute,
);
app.use(
  "/products",
  jwtAuth,
  authorizedRoles("owner", "manager"),
  productsRoute,
);
app.use(
  "/purchase",
  jwtAuth,
  authorizedRoles("owner", "manager", "user"),
  purchaseRoute,
);
app.use(
  "/sales",
  jwtAuth,
  authorizedRoles("owner", "manager", "user"),
  salesRoute,
);
app.use("/auth", authRoute);
app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
