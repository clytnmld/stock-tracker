import ReactDOM from "react-dom/client";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../index.css";

const BASE_URL_API = "http://localhost:3000/";

export function LearnRegister() {
  const registerFormat = {
    name: "",
    email: "",
    password: "",
    role: "",
  };
  const [register, setRegister] = React.useState(registerFormat);
  const [error, setError] = React.useState("");

  const handleChange = (e) => {
    setRegister({
      ...register,
      [e.target.name]: e.target.value,
    });
  };

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const response = await fetch(BASE_URL_API + "auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(register),
      });
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Something went wrong");
        return;
      }

      setError("");
      navigate("/login");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>Please register</h2>
      <input
        type="text"
        name="name"
        placeholder="Name"
        style={{ margin: "10px" }}
        value={register.name}
        onChange={handleChange}
      />
      <input
        type="text"
        name="email"
        placeholder="Email"
        style={{ margin: "10px" }}
        value={register.email}
        onChange={handleChange}
      />
      <select
        name="role"
        id="roles"
        placeholder="Choose your role"
        value={register.role}
        onChange={handleChange}
        style={{ margin: "10px" }}
      >
        <option value="" disabled hidden>
          Choose your role
        </option>
        <option value="owner">Owner</option>
        <option value="manager">Manager</option>
        <option value="user">User</option>
      </select>
      <input
        type="password"
        name="password"
        placeholder="Password"
        style={{ margin: "10px" }}
        value={register.password}
        onChange={handleChange}
      />
      <br />
      <button onClick={fetchData}>Submit</button>
      {error && <p>{error}</p>}
    </div>
  );
}
