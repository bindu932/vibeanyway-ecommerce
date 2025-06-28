import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const nav = useNavigate();

  const cards = [
    { label: '➕ Add Product', route: '/admin/add-product', icon: '🛍️' },
    { label: '✏️ Edit Products', route: '/admin/products', icon: '🛠️' },
    { label: '👥 View Customers', route: '/admin/customers', icon: '👤' },
    
  ];

  return (
    <div className="admin-dashboard">
      {/* <header className="dashboard-header">
        <div className="logo">🛍️ VibeAnyway</div>
        <nav className="dashboard-nav">
          <button onClick={() => nav('/admin')}>Dashboard</button>
          <button onClick={() => nav('/admin/products')}>Products</button>
          <button onClick={() => nav('/admin/customers')}>Customers</button>
          <button onClick={() => nav('/logout')}>Logout</button>
        </nav>
      </header> */}

      <div className="dashboard-content">
        <h1 className="dashboard-title">⚙️ Admin Dashboard</h1>

        <div className="card-container">
          {cards.map((c) => (
            <div key={c.label} className="dash-card" onClick={() => nav(c.route)}>
              <div className="icon">{c.icon}</div>
              <div className="label">{c.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
