import ReactDOM from "react-dom/client";
import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../index.css";
import { useParams } from "react-router-dom";

const BASE_URL_API = "http://localhost:3000/";
export function LearnWarehouse() {
  const [isError, setIsError] = React.useState("");
  const [warehouse, setWarehouse] = React.useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(BASE_URL_API + "warehouse/all/active", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
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

  const fetchDelete = async (id) => {
    try {
      const response = await fetch(BASE_URL_API + `warehouse/${id}`, {
        method: "DELETE",
        headers: {
          "content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.status !== 200) {
        const errorData = await response.json();
        setIsError(errorData.error || "Something went wrong");
        console.error(errorData.error || "Something went wrong");
        return;
      }
      setIsError("");
      const data = await response.json();
      setWarehouse((prev) => prev.filter((w) => w.id !== id));
      console.log("Warehouse created:", data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchDeletedWarehouse = async () => {
    const fetchData = async () => {
      try {
        const response = await fetch(BASE_URL_API + "warehouse/all/deleted", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
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
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>Warehouse Management</h2>
      <ul>
        {warehouse.map((item) => (
          <li key={item.id}>
            <span style={{ margin: "1rem" }}>
              Name : {item.name} - Total stock: {item.totalStock}
            </span>
            <Link to={`/warehouse/edit/${item.id}`}>
              <button>Edit</button>
            </Link>
            <button onClick={() => fetchDelete(item.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <Link to="/warehouse/create">
        <button style={{ marginBottom: "10px" }}>Create Warehouse</button>
      </Link>
      <br />
      <button onClick={fetchDeletedWarehouse} style={{ marginBottom: "10px" }}>
        View Deleted Warehouses
      </button>
      <Link to="/homepage">
        <button>Back to Homepage</button>
      </Link>
      {isError && <p>{isError}</p>}
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
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(warehouseName),
      });
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
  };
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

export function EditWarehouse() {
  const { warehouseId } = useParams();
  const navigate = useNavigate();
  const warehouseFormat = {
    name: "",
  };
  console.log("Params:", warehouseId);
  const [warehouseName, setWarehouseName] = React.useState(warehouseFormat);
  const [isError, setIsError] = React.useState("");
  const handleChange = (e) => {
    setWarehouseName({
      ...warehouseName,
      [e.target.name]: e.target.value,
    });
  };
  useEffect(() => {
    const fetchWarehouse = async () => {
      try {
        const response = await fetch(
          BASE_URL_API + `warehouse/${warehouseId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        if (response.status !== 200) {
          console.error("Failed to fetch warehouse data");
          return;
        }
        const data = await response.json();
        setWarehouseName({ name: data[0].name });
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchWarehouse();
  }, [warehouseId]);
  const fetchData = async () => {
    try {
      const response = await fetch(BASE_URL_API + `warehouse/${warehouseId}`, {
        method: "PUT",
        headers: {
          "content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(warehouseName),
      });
      if (response.status !== 200) {
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
  };
  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>Edit Warehouse</h2>
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
