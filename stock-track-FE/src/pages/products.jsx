import ReactDOM from "react-dom/client";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "../index.css";

const BASE_URL_API = "http://localhost:3000/";
export function LearnProducts() {
  const [products, setProducts] = React.useState([]);
  const [isLoading, setLoading] = React.useState(false);
  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const response = await fetch(BASE_URL_API + "products/all", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
        });
        if (response.status !== 200) {
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
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>Products Management</h2>
      {isLoading ? <h1>Loading...</h1> : 
      <>
      <ul>
        {products.map((item) => (
          <li key={item.id}>
            <p>Name : {item.name} - Price: {item.price}</p>
            <ul>
              {item.productStock.map((ps) => (
                <li key={`${ps.productId}-${ps.warehouseId}`}>
                  Warehouse: {ps.warehouse.name} - Stock: {ps.stock}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <Link to="/homepage">
        <button>Back to Homepage</button>
      </Link>
      </>
      }
    </div>
  );
}

