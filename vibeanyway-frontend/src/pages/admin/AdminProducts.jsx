// src/admin/AdminProducts.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminProducts.css";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:5000/api/products")
      .then(res => setProducts(res.data))
      .catch(err => console.error("❌ Failed to fetch products:", err));
  }, []);

  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this product?");
    if (!confirm) return;

    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`);
      setProducts((prev) => prev.filter((product) => product._id !== id));
      alert("✅ Product deleted successfully.");
    } catch (error) {
      console.error("❌ Failed to delete product:", error);
      alert("❌ Failed to delete product.");
    }
  };

  const handleEdit = (product) => {
    navigate(`/admin/edit/${product._id}`);
  };

  return (
    <div className="admin-products-page">
      <h2>📦 All Products</h2>
      <div className="product-list">
        {products.map(product => (
          <div key={product._id} className="product-card">
            <img src={product.imageUrl} alt={product.name} />
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p><strong>₹{product.price}</strong></p>
            <p>Category: {product.category} / {product.subcategory}</p>
            <p>Sizes: {product.sizes.join(", ")}</p>
            <p>Stock: {Object.entries(product.stock).map(([size, qty]) => `${size}: ${qty}`).join(" | ")}</p>
            <div className="admin-actions">
              <button className="edit-btn" onClick={() => handleEdit(product)}>✏️ Edit</button>
              <button className="delete-btn" onClick={() => handleDelete(product._id)}>🗑️ Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
