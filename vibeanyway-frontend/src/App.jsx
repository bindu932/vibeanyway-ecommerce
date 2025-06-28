import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";

// User Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/user/Profile";
import Cart from "./pages/user/Cart";
import Wishlist from "./pages/user/Wishlist";
import SearchPage from "./pages/user/SearchPage";
import Orders from "./pages/user/Orders";
import BuyNow from "./pages/user/BuyNow";
import Payment from "./pages/user/Payment";
import CompleteOrder from "./pages/user/CompleteOrder";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AddProduct from "./pages/admin/AddProduct";
import EditProducts from "./pages/admin/EditProducts";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCustomers from "./pages/admin/AdminCustomers";

// Redirect root to Canva site
function CanvaRedirect() {
  useEffect(() => {
    window.location.href = "https://vibeherenow.my.canva.site/";
  }, []);
  return null;
}

// Admin route protection
const ProtectedAdminRoute = ({ element }) => {
  const isAdmin = sessionStorage.getItem("admin") === "true";
  return isAdmin ? element : <Navigate to="/admin/login" />;
};

// Wrapper to access location outside of <Routes>
function AppWrapper() {
  const location = useLocation();
  const hideNavbarRoutes = ["/login", "/signup", "/admin/login"];
  const showNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}

      <Routes>
        {/* 🌐 Public Routes */}
        <Route path="/" element={<CanvaRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/buy-now" element={<BuyNow />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/complete-order" element={<CompleteOrder />} />

        {/* 🔐 Admin Routes (Protected) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedAdminRoute element={<AdminDashboard />} />} />
        <Route path="/admin/add-product" element={<ProtectedAdminRoute element={<AddProduct />} />} />
        <Route path="/admin/edit/:id" element={<ProtectedAdminRoute element={<EditProducts />} />} />
        <Route path="/admin/products" element={<ProtectedAdminRoute element={<AdminProducts />} />} />
        <Route path="/admin/customers" element={<ProtectedAdminRoute element={<AdminCustomers />} />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppWrapper />
    </BrowserRouter>
  );
}
