import { Link } from "react-router-dom";

export function PageNotFound() {
  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>Balik lagi ya</h2>
      <p>The page you are looking for does not exist.</p>
      <Link to="/register">
        <button>Go back to Home</button>
      </Link>
    </div>
  );
}
