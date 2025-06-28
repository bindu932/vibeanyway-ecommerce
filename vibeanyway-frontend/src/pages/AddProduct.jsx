import { useState } from "react";
import { db } from "../firebase"; 

import axios from "axios";

export default function AddProduct() {
  const [form, setForm] = useState({ name: "", description: "", image: null });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", form.name);
    data.append("description", form.description);
    data.append("image", form.image);

    try {
        await axios.post("http://13.60.188.11:5000/api/products", data);


      alert("✅ Product added successfully");
      setForm({ name: "", description: "", image: null });
    } catch (err) {
      console.error(err);
      alert("❌ Error adding product");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4 mt-10">
      <h2 className="text-xl font-bold text-center">Add New Product</h2>
      <input
        type="text"
        placeholder="Product Name"
        className="w-full border p-2 rounded"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
      />
      <textarea
        placeholder="Description"
        className="w-full border p-2 rounded"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        required
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
        required
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
      >
        Upload Product
      </button>
    </form>
  );
}
