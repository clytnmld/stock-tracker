import ReactDOM from "react-dom/client";
import React, { useEffect } from "react";
import { Link, useNavigate} from "react-router-dom";
import "../index.css";

const BASE_URL_API = "http://localhost:3000/";
export function LearnWarehouse() {
  const [warehouse, setWarehouse] = React.useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(BASE_URL_API + "warehouse/all", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
        });
        if (!response.status === 200) {
          console.error("Failed to fetch warehouse data");
          return;
        }
        const data = await response.json();
        setWarehouse(data);
        console.log("Warehouse data:", data);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>Warehouse Management</h2>
      <ul>
        {warehouse.map((item) => (
          <li key={item.id}>
            Name : {item.name} - Total stock: {item.totalStock}
          </li>
        ))}
      </ul>
      <Link to="/warehouse/create">
        <button style={{marginBottom: '10px'}}>Create Warehouse</button>
      </Link>
      <br />
      <Link to="/homepage">
        <button>Back to Homepage</button>
      </Link>
    </div>
  );
}

export function CreateWarehouse() {
  const warehouseFormat = {
    name: "",
  };
  const navigate = useNavigate();
  const [warehouseName, setWarehouseName] = React.useState(warehouseFormat);
  const [isError, setIsError] = React.useState("");
  const handleChange = (e) => {
    setWarehouseName({
      ...warehouseName,
      [e.target.name]: e.target.value,
    });
  };
  const fetchData = async () => {
    try {
      const response = await fetch(BASE_URL_API + "warehouse", {
        method: "POST",
        headers: {
          "content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(warehouseName),
      })
      if (response.status !== 201) {
        const errorData = await response.json();
        setIsError(errorData.error || "Something went wrong");
        console.error(errorData.error || "Something went wrong");
        return;
      }
      setIsError("");
      const data = await response.json();
      navigate("/warehouse");
      console.log("Warehouse created:", data);
    } catch (error) {
      console.error("Error:", error);
    }
  }
  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>Create Warehouse</h2>
      <input
        type="text"
        name="name"
        placeholder="Warehouse Name"
        style={{ margin: "10px" }}
        value={warehouseName.name}
        onChange={handleChange}
      />
      <button onClick={fetchData}>Submit</button>
      <Link to="/warehouse">
        <button>Back to warehouse</button>
      </Link>
      {isError && <p>{isError}</p>}
    </div>
  );
}

