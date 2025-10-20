import ReactDOM from "react-dom/client";
import React from "react";
import { Link } from "react-router-dom";
import "../index.css";

export function LearnHomepage() {
  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>Welcome to Stock Track</h2>
      <p>Your one-stop solution for tracking stocks efficiently.</p>
      <Link to="/register">
        <button>Get Started</button>
      </Link>
      <p>Already have an account? please login</p>
      <Link to="/login">
        <button>Login</button>
      </Link>
    </div>
  );
}

export function Homepage() {
  return (
    <div>
      <h1>Choose service</h1>
      <p>This is the homepage of the Stock Track application.</p>
      <Link to="/warehouse">
        <button style={{ margin: "10px" }}>Warehouse</button>
      </Link>
      <Link to="/products">
        <button style={{ margin: "10px" }}>Products</button>
      </Link>
      <Link to="/purchase">
        <button style={{ margin: "10px" }}>Purchase</button>
      </Link>
      <Link to="/sales">
        <button style={{ margin: "10px" }}>Sales</button>
      </Link>
    </div>
  );
}
