import React, { useState } from 'react';
import axios from 'axios';

const AdminAddProduct = () => {
  const [product, setProduct] = useState({
    name: '',
    description: '',
  });
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Uploading...');

    const formData = new FormData();
    formData.append('name', product.name);
    formData.append('description', product.description);
    formData.append('image', image);

    try {
      const res = await axios.post('http://<EC2-IP>:5000/api/products', formData);
      console.log(res.data);
      setStatus('✅ Product added successfully!');
    } catch (err) {
      console.error(err);
      setStatus('❌ Failed to upload product.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Add New Product</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={product.name}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={product.description}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
        <input
          type="file"
          onChange={handleImageChange}
          className="p-2 border rounded"
          accept="image/*"
          required
        />
        <button type="submit" className="bg-blue-600 text-white py-2 rounded">
          Add Product
        </button>
      </form>
      {status && <p className="mt-4 text-sm">{status}</p>}
    </div>
  );
};

export default AdminAddProduct;
