import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./EditProducts.css";

export default function EditProducts() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const sizesList = ["S", "M", "L", "XL", "XXL"];

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/products/${id}`)
      .then((res) => {
        const prod = res.data;
        setProduct({
          ...prod,
          sizes: Array.isArray(prod.sizes) ? prod.sizes : JSON.parse(prod.sizes),
          stock: typeof prod.stock === "object" ? prod.stock : JSON.parse(prod.stock),
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Failed to fetch product:", err);
        setLoading(false);
        setMessage("❌ Failed to load product.");
      });
  }, [id]);

  const handleChange = (field, value) => {
    setProduct({ ...product, [field]: value });
  };

  const toggleSize = (size) => {
    const updatedSizes = [...product.sizes];
    if (updatedSizes.includes(size)) {
      const newStock = { ...product.stock };
      delete newStock[size];
      setProduct({
        ...product,
        sizes: updatedSizes.filter((s) => s !== size),
        stock: newStock,
      });
    } else {
      setProduct({
        ...product,
        sizes: [...updatedSizes, size],
        stock: { ...product.stock, [size]: product.stock[size] || 0 },
      });
    }
  };

  const handleStockChange = (size, value) => {
    setProduct({
      ...product,
      stock: { ...product.stock, [size]: value },
    });
  };

  const handleSave = async () => {
    try {
      const updated = {
        name: product.name,
        price: Number(product.price),
        description: product.description,
        category: product.category,
        subcategory: product.subcategory,
        sizes: product.sizes,
        stock: product.stock,
      };

      console.log("📤 Updating Product ID:", id);
      console.log("📦 Payload:", updated);

      await axios.put(`http://localhost:5000/api/products/${id}`, updated);
      setMessage("✅ Product updated successfully.");
    } catch (err) {
      console.error("❌ Error updating product:", err);
      setMessage("❌ Failed to update product.");
    }
  };

  if (loading) return <p>⏳ Loading product...</p>;
  if (!product) return <p>❌ Product not found.</p>;

  return (
    <div className="edit-product-page">
      <h2>✏️ Edit Product: {product.name}</h2>
      <div className="edit-product-form">
        <img src={product.imageUrl} alt={product.name} style={{ width: "200px" }} />

        <input
          type="text"
          value={product.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Product Name"
        />

        <input
          type="number"
          value={product.price}
          onChange={(e) => handleChange("price", e.target.value)}
          placeholder="Price"
        />

        <textarea
          value={product.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Description"
        />

        <select value={product.category} onChange={(e) => handleChange("category", e.target.value)} required>
          <option value="">Select Category</option>
          <option value="Men">Men</option>
          <option value="Women">Women</option>
          <option value="Kids">Kids</option>
        </select>

        <select value={product.subcategory} onChange={(e) => handleChange("subcategory", e.target.value)} required>
          <option value="">Select Subcategory</option>
          <option value="Bodywear">Bodywear</option>
          <option value="Footwear">Footwear</option>
          <option value="Accessories">Accessories</option>
          <option value="Electronics">Electronics</option>
        </select>

        <div className="size-selector">
          {sizesList.map((size) => (
            <button
              type="button"
              key={size}
              className={`size-btn ${product.sizes.includes(size) ? "selected" : ""}`}
              onClick={() => toggleSize(size)}
            >
              {size}
            </button>
          ))}
        </div>

        {product.sizes.map((size) => (
          <div key={size}>
            <label>
              Stock for {size}:
              <input
                type="number"
                value={product.stock[size]}
                onChange={(e) => handleStockChange(size, e.target.value)}
              />
            </label>
          </div>
        ))}

        <button onClick={handleSave}>💾 Confirm Changes</button>
        <button onClick={() => navigate("/admin/products")} style={{ marginLeft: "10px" }}>
          ⬅️ Cancel
        </button>

        {message && <p className="status-message">{message}</p>}
      </div>
    </div>
  );
}
