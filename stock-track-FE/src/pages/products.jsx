import ReactDOM from "react-dom/client";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "../index.css";

const BASE_URL_API = "http://localhost:3000/";
export function LearnProducts() {
  const [products, setProducts] = React.useState([]);
  const [isLoading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const response = await fetch(BASE_URL_API + "products/all", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) {
          console.error("Failed to fetch warehouse data");
          return;
        }
        if (response.status === 401) {
          navigate("/login");
          return;
        }

        const data = await response.json();
        setProducts(data);
        console.log("Products data:", data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>Products Management</h2>
      {isLoading ? (
        <h1>Loading...</h1>
      ) : (
        <>
          <ul>
            {products.map((item) => (
              <li key={item.id}>
                <span>
                  Name : {item.name} - Price: {item.price}
                </span>
                <ul>
                  {item.productStock.map((ps) => (
                    <li key={`${ps.productId}-${ps.warehouseId}`}>
                      <span>
                        Warehouse: {ps.warehouse.name} - Stock: {ps.stock}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link to={`/products/edit/${item.id}`}>
                  <button>Edit</button>
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/products/create">
            <button style={{ marginBottom: "10px" }}>Create Product</button>
          </Link>
          <Link to="/homepage">
            <button>Back to Homepage</button>
          </Link>
        </>
      )}
    </div>
  );
}

// sorry all the function here i use AI because i wanted to improve it so can directly make stock in multiple warehouse, but give up when trying to make the dynamic components :')
export function CreateProducts() {
  const [warehouse, setWarehouse] = React.useState([]);
  const [isError, setIsError] = useState();
  const warehouseFormat = {
    name: "",
    price: "",
    productStock: [{ warehouseId: "", stock: "" }],
  };
  const navigate = useNavigate();
  const [product, setProduct] = React.useState(warehouseFormat);
  useEffect(() => {
    const fetchWarehouse = async () => {
      try {
        const response = await fetch(BASE_URL_API + "warehouse/all/active", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        setWarehouse(data);
      } catch (error) {
        console.error("Error fetching warehouse:", error);
      }
    };
    fetchWarehouse();
  }, []);
  const fetchData = async () => {
    try {
      const response = await fetch(BASE_URL_API + "products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(product),
      });
      if (!response.status === 200) {
        const error = await response.json();
        setIsError(error.message || "Something went wrong");
        console.error(error.message || "Something went wrong");
        return;
      }
      setIsError("");
      const data = response.json();
      navigate("/products");
      console.log("Created product:", data);
    } catch {
      console.error("Error:", isError);
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({
      ...product,
      [name]: value,
    });
  };

  // Handle warehouse-stock pair change
  const handleStockChange = (index, field, value) => {
    const updatedStocks = [...product.productStock];
    updatedStocks[index][field] = value;
    setProduct({ ...product, productStock: updatedStocks });
  };

  // Add new warehouse-stock pair
  const addWarehouseField = () => {
    setProduct({
      ...product,
      productStock: [...product.productStock, { warehouseId: "", stock: "" }],
    });
  };

  // Remove warehouse-stock pair
  const removeWarehouseField = (index) => {
    const updatedStocks = product.productStock.filter((_, i) => i !== index);
    setProduct({ ...product, productStock: updatedStocks });
  };

  // Filter out already selected warehouses
  const getAvailableWarehouses = (currentIndex) => {
    const selectedIds = product.productStock
      .map((ps, i) => (i !== currentIndex ? ps.warehouseId : null))
      .filter(Boolean);
    return warehouse.filter((wh) => !selectedIds.includes(wh.id.toString()));
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>Create Product</h2>

      <label>Product name:</label>
      <input
        type="text"
        name="name"
        placeholder="Product Name"
        style={{ margin: "10px" }}
        value={product.name}
        onChange={handleChange}
      />

      <label>Price:</label>
      <input
        type="number"
        name="price"
        placeholder="Product Price"
        style={{ margin: "10px" }}
        value={product.price}
        onChange={handleChange}
      />

      <h3>Warehouses</h3>
      {product.productStock.map((stock, index) => (
        <div key={index} style={{ marginBottom: "10px" }}>
          <select
            value={stock.warehouseId}
            onChange={(e) =>
              handleStockChange(index, "warehouseId", e.target.value)
            }
          >
            <option value="">Select Warehouse</option>
            {getAvailableWarehouses(index).map((wh) => (
              <option key={wh.id} value={wh.id}>
                {wh.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Stock"
            value={stock.stock}
            onChange={(e) => handleStockChange(index, "stock", e.target.value)}
            style={{ marginLeft: "10px" }}
          />

          {product.productStock.length > 1 && (
            <button
              onClick={() => removeWarehouseField(index)}
              style={{ marginLeft: "10px" }}
            >
              ❌
            </button>
          )}
        </div>
      ))}

      <button onClick={addWarehouseField}>➕ Add Warehouse</button>

      <button onClick={fetchData}>Submit</button>
      {isError && <p>{isError}</p>}
    </div>
  );
}

export function EditProducts() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const productFormat = {
    name: "",
    price: "",
    productStocks: [
      {
        warehouseId: "",
        stock: "",
      },
    ],
  };
  const [product, setProduct] = React.useState(productFormat);
  const [isError, setIsError] = React.useState("");
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "warehouseId" || name === "stock") {
      setProduct({
        ...product,
        productStocks: [
          {
            ...product.productStocks?.[0],
            [name]: value,
          },
        ],
      });
    } else {
      setProduct({
        ...product,
        [name]: value,
      });
    }
  };
  const [warehouse, setWarehouse] = React.useState([]);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log("Fetching product with ID:", productId);
        const response = await fetch(BASE_URL_API + `products/${productId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.status !== 200) {
          console.error(
            "Failed to fetch product data:",
            response.status,
            response.statusText,
          );
          if (response.statusText === "Unauthorized") {
            navigate("/login");
          }
          return;
        }

        const data = await response.json();
        console.log("Product data:", data);
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    const fetchWarehouse = async () => {
      try {
        const response = await fetch(BASE_URL_API + "warehouse/all/active", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.status !== 200) {
          console.error(
            "Failed to fetch warehouse data:",
            response.status,
            response.statusText,
          );
          return;
        }

        const data = await response.json();
        setWarehouse(data);
        console.log("Warehouse data:", data);
      } catch (error) {
        console.error("Error fetching warehouse:", error);
      }
    };
    fetchProducts();
    fetchWarehouse();
  }, [productId, navigate]);

  useEffect(() => {
    console.log("Product state updated:", product);
    console.log("warehouse state updated:", warehouse);
  }, [product, warehouse]);

  const fetchData = async () => {
    const cleanProduct = {
      name: product.name,
      price: product.price,
      warehouses: product.productStocks.map((stockItem) => ({
        warehouseId: stockItem.warehouseId,
        stock: stockItem.stock,
      })),
    };
    try {
      const response = await fetch(BASE_URL_API + `products/${productId}`, {
        method: "PUT",
        headers: {
          "content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(cleanProduct),
      });
      if (response.status !== 200) {
        const errorData = await response.json();
        setIsError(errorData.error || "Something went wrong");
        console.error(errorData.error || "Something went wrong");
        return;
      }
      setIsError("");
      const data = await response.json();
      navigate("/products");
      console.log("products created:", data);
    } catch (error) {
      console.error("Error:", error);
    }
  };
  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>Create Products - To be implemented</h2>
      <label>product name :</label>
      <input
        type="text"
        name="name"
        placeholder="Product Name"
        style={{ margin: "10px" }}
        value={product.name}
        onChange={handleChange}
      />
      <label>price :</label>
      <input
        type="number"
        name="price"
        placeholder="Product Price"
        style={{ margin: "10px" }}
        value={product.price}
        onChange={handleChange}
      />
      <br />
      <label>warehouse :</label>
      <select
        name="warehouseId"
        value={product.productStocks?.[0]?.warehouseId || ""}
        onChange={handleChange}
        style={{ margin: "10px" }}
      >
        <option value="">Select Warehouse</option>
        {warehouse.map((wh) => (
          <option key={wh.id} value={wh.id}>
            {wh.name}
          </option>
        ))}
      </select>
      <label>stock :</label>
      <input
        type="number"
        name="stock"
        value={product.productStocks?.[0]?.stock || ""}
        placeholder="Initial Stock"
        style={{ margin: "10px" }}
        onChange={handleChange}
      />
      <br />
      <button onClick={fetchData}>Create Product</button>
      <Link to="/homepage">
        <button>Back to Homepage</button>
      </Link>
      {isError && <p>{isError}</p>}
    </div>
  );
}
