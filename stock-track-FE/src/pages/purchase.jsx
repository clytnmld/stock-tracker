import ReactDOM from "react-dom/client";
import React from "react";
import { Link } from "react-router-dom";
import "../index.css";

const BASE_URL_API = "http://localhost:3000/";
export function LearnPurchase() {
  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>Purchase Management</h2>
      <Link to="/homepage">
        <button>Back to Homepage</button>
      </Link>
    </div>
  );
}
