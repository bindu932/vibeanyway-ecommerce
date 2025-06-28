import React, { useState } from "react";
import axios from "axios";
import "./AddProduct.css";

export default function AddProduct() {
  const [product, setProduct] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    subcategory: "",
    sizes: [],
    stock: {},
  });

  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const sizesList = ["S", "M", "L", "XL", "XXL"];

  const toggleSize = (size) => {
    const sizes = [...product.sizes];
    if (sizes.includes(size)) {
      const newStock = { ...product.stock };
      delete newStock[size];
      setProduct({
        ...product,
        sizes: sizes.filter((s) => s !== size),
        stock: newStock,
      });
    } else {
      setProduct({
        ...product,
        sizes: [...sizes, size],
        stock: { ...product.stock, [size]: 0 },
      });
    }
  };

  const handleStockChange = (size, value) => {
    setProduct({
      ...product,
      stock: { ...product.stock, [size]: value },
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear subcategory if category becomes "Electronics"
    if (name === "category" && value === "Electronics") {
      setProduct({ ...product, category: value, subcategory: "" });
    } else {
      setProduct({ ...product, [name]: value });
    }
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) return setMessage("❌ Please select an image.");
    setLoading(true);

    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("price", product.price);
    formData.append("description", product.description);
    formData.append("category", product.category);
    formData.append("subcategory", product.category === "Electronics" ? "" : product.subcategory);
    formData.append("sizes", JSON.stringify(product.sizes));
    formData.append("stock", JSON.stringify(product.stock));
    formData.append("image", imageFile);

    try {
      const res = await axios.post("http://localhost:5000/api/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("✅ Product added successfully!");
      console.log("🎉 Response:", res.data);
      setProduct({
        name: "",
        price: "",
        description: "",
        category: "",
        subcategory: "",
        sizes: [],
        stock: {},
      });
      setImageFile(null);
    } catch (err) {
      console.error("❌ Upload failed:", err);
      setMessage("❌ Failed to upload product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-page">
      <h2>Add New Product</h2>
      <form onSubmit={handleSubmit} className="add-product-form">
        <input name="name" placeholder="Product Name" value={product.name} onChange={handleChange} required />
        <input name="price" type="number" placeholder="Price" value={product.price} onChange={handleChange} required />
        <textarea name="description" placeholder="Description" value={product.description} onChange={handleChange} required />

        <select name="category" value={product.category} onChange={handleChange} required>
          <option value="">Select Category</option>
          <option value="Men">Men</option>
          <option value="Women">Women</option>
          <option value="Kids">Kids</option>
          <option value="Electronics">Electronics</option>
          <option value="Furniture">Furniture</option>
        </select>

        {product.category !== "Electronics" && (
          <select name="subcategory" value={product.subcategory} onChange={handleChange} required>
            <option value="">Select Subcategory</option>
            <option value="Bodywear">Bodywear</option>
            <option value="Footwear">Footwear</option>
            <option value="Accessories">Accessories</option>
            <option value="Furniture">Furniture</option>
          </select>
        )}

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
                required
              />
            </label>
          </div>
        ))}

        <input type="file" accept="image/*" onChange={handleImageChange} required />

        <button type="submit" disabled={loading}>
          {loading ? "Uploading..." : "➕ Add Product"}
        </button>
      </form>
      {message && <p className="status-message">{message}</p>}
    </div>
  );
}
