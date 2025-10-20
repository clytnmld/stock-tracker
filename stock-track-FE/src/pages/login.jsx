import ReactDOM from "react-dom/client";
import React from "react";
import { Link } from "react-router-dom";

const BASE_URL_API = "http://localhost:3000/";

export function LearnLogin() {
  const loginFormat = {
    email: "",
    password: "",
  };
  const [login, setLogin] = React.useState(loginFormat);
  const handleChange = (e) => {
    setLogin({
      ...login,
      [e.target.name]: e.target.value,
    });
  };
  const fetchData = async () => {
    try {
      const response = await fetch(BASE_URL_API + "auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(login),
      });
      if (!response.status === 200) {
        throw new Error("something went wrong");
      }
      const data = await response.json();
      console.log(data);
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      console.log("Token from localStorage:", localStorage.getItem("token"));
    } catch (error) {
      console.error("Error:", error);
    }
  };
  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>Please login</h2>
      <input
        type="text"
        name="email"
        placeholder="Email"
        style={{ margin: "10px" }}
        value={login.email}
        onChange={handleChange}
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        style={{ margin: "10px" }}
        value={login.password}
        onChange={handleChange}
      />
      <br />
      <Link to="/homepage">
      <button onClick={fetchData}>Login</button>
      </Link>
      <p>
        Don't have an account?
        <Link to="/register"> Please register</Link>
      </p>
    </div>
  );
}
