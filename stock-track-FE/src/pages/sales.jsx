import ReactDOM from "react-dom/client";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "../index.css";

const BASE_URL_API = "http://localhost:3000/";
export function LearnSales() {
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
        if (response.status === 401) {
          navigate("/login");
          return;
        }
        if (!response.ok) {
          console.error("Failed to fetch warehouse data");
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
      <h2>Sales Management</h2>
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
                <Link to={`${item.id}`}>
                  <button style={{ margin: "20px" }}>Sales</button>
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/homepage">
            <button>Back to Homepage</button>
          </Link>
        </>
      )}
    </div>
  );
}

export function DoSales() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const salesFormat = {
    value: "",
    warehouseId: "",
  };
  const [sales, setSales] = useState(salesFormat);
  const [warehouse, setWarehouse] = useState([]);
  const [product, setProduct] = useState({})
  const [isError, setIsError] = useState("");
  const [isLoading, setLoading] = React.useState(false);
  const handleChange = (e) => {
    setSales({
      ...sales,
      [e.target.name]: e.target.value,
    });
  };
  useEffect(() => {
    const fetchWarehouse = async () => {
      try {
        setLoading(true);
        const response = await fetch(BASE_URL_API + "warehouse/all/active", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.status == 401) {
          navigate("/login");
        }
        if (!response.ok) {
          const errorData = await response.json();
          setIsError(errorData.error || "Something went wrong");
          return;
        }
        
        const data = await response.json();
        setWarehouse(data);
      } catch (error) {
        console.log(error);
      }
      setLoading(false);
    };
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(BASE_URL_API + `products/${productId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          setIsError(errorData.error || "Something went wrong");
          return;
        }
        if (response.status == 401) {
          navigate("/login");
        }
        const data = await response.json();
        console.log('data from fetch', data)
        setProduct(data);
      } catch (error) {
        console.log(error);
      }
      setLoading(false);
    };
    fetchProducts()
    fetchWarehouse();
  }, [productId, navigate]);
  useEffect(() => {
    console.log('usestate product',product)
    console.log('usestate warehouse',warehouse)
  }, [product, warehouse])
  const fetchData = async () => {
    try {
      const response = await fetch(BASE_URL_API + `sales/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(sales),
      });
      if (!response.ok) {
        const errorData = await response.json();
        setIsError(errorData.error || "Something went wrong");
        return;
      }
      if (response.status == 401) {
        navigate("/login");
      }
      const data = await response.json();
      setSales(data);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>Sales Management</h2>
      {isLoading ? (
        <h1>Loading...</h1>
      ) : product.productStock?.length === 0 ? (
        <p>No stock data found for this product. Please to create some stock for this product</p>
      ) : (
        <>
          <select
            name="warehouseId"
            value={sales.warehouseId}
            onChange={handleChange}
            style={{ margin: "10px" }}
          >
            <option>Select warehouse</option>
            {product.productStock?.map((stock) => (
              <>
              <option key={stock.warehouseId} value={stock.warehouseId}>
                {stock.warehouse.name}
              </option>
              </>
            ))}
          </select>
          {sales.warehouseId && (
          <p>
            Available stock:{" "}
            {
              product.productStock.find(
                (s) => s.warehouseId === parseInt(sales.warehouseId)
              )?.stock ?? 0
            }
          </p>
        )}
          <input
            type="number"
            name="value"
            value={sales.value}
            placeholder="Sales"
            style={{ margin: "10px" }}
            onChange={handleChange}
          />
          <Link to={'/sales'}>
          <button onClick={fetchData}>Submit</button>
          </Link>
          {isError && <p>{isError}</p>}
        </>
      )}
    </div>
  );
}
