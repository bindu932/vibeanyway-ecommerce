import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth } from "../firebase";
import { useEffect, useState } from "react";
import "./Navbar.css";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const hideNavbar = location.pathname === "/login" || location.pathname === "/signup";

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    sessionStorage.clear();
    navigate("/login");
  };

  const isAdmin = sessionStorage.getItem("admin") === "true";

  // ✅ Do not render navbar on login/signup pages
  if (hideNavbar) return null;

  return (
    <nav className="navbar">
      <h1 className="logo" onClick={() => navigate(user ? "/search" : "/")}>
        🛍️ VibeAnyway
      </h1>

      {!user ? (
        <div className="nav-links">
          <Link to="/login">Login</Link>
          <Link to="/signup">Signup</Link>
        </div>
      ) : isAdmin ? (
        <div className="nav-links">
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/products">Products</Link>
          <Link to="/admin/customers">Customers</Link>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <div className="nav-icons">
          <button onClick={() => navigate("/search")} title="Search">🔍</button>
          <button onClick={() => navigate("/wishlist")} title="Wishlist">❤️</button>
          <button onClick={() => navigate("/cart")} title="Cart">🛒</button>
          <button onClick={() => navigate("/profile")} title="Profile">👤</button>
          <button onClick={handleLogout} title="Logout">🚪</button>
        </div>
      )}
    </nav>
  );
}
