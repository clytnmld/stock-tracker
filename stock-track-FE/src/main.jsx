import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import { LearnRegister } from "./pages/register.jsx";
import { ScoreBoard } from "./pages/scoreBoard.jsx";
import { LearnLogin } from "./pages/login.jsx";
import { PageNotFound } from "./pages/notFound.jsx";
import { LearnHomepage, Homepage } from "./pages/homepage.jsx";
import { LearnWarehouse, CreateWarehouse } from "./pages/warehouse.jsx";
import { LearnProducts } from "./pages/products.jsx";
import { LearnPurchase } from "./pages/purchase.jsx";
import { LearnSales } from "./pages/sales.jsx";

const router = createBrowserRouter([
  {
    path: "/warehouse",
    element: <LearnWarehouse />,
    errorElement: <LearnLogin />,
  },
  {
    path: "/warehouse/create",
    element: <CreateWarehouse />,
    errorElement: <LearnLogin />,
  },
  {
    path: "/products",
    element: <LearnProducts />,
    errorElement: <LearnLogin />,
  },
  {
    path: "/purchase",
    element: <LearnPurchase />,
    errorElement: <LearnLogin />,
  },
  {
    path: "/sales",
    element: <LearnSales />,
    errorElement: <LearnLogin />,
  },
  {
    path: "/",
    element: <LearnHomepage />,
    errorElement: <PageNotFound />,
  },
  {
    path: "/homepage",
    element: <Homepage />,
  },
  {
    path: "/scoreboard",
    element: <ScoreBoard />,
  },
  {
    path: "/login",
    element: <LearnLogin />,
  },
  {
    path: "/register",
    element: <LearnRegister />,
  },
]);

createRoot(document.getElementById("root")).render(
    <RouterProvider router={router} />
);
