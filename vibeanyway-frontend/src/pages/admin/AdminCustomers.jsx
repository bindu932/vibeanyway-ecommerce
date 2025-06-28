import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminCustomers.css";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // ✅ Fetch customers from Firebase Auth
    axios.get("http://localhost:5000/api/users/firebase").then(res => {
        setCustomers(res.data); // Expected: array of users
      })
      .catch(err => {
        console.error("❌ Error fetching users:", err);
        setCustomers([]); // fail-safe
      });

    // ✅ Fetch orders from backend
    axios.get("http://localhost:5000/api/orders/firebase")
      .then(res => {
        const data = res.data?.orders || res.data || [];
        setOrders(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error("❌ Error fetching orders:", err);
        setOrders([]); 
      });
  }, []);

  const formatDate = (date) => {
    if (!date) return "N/A";
    try {
      if (typeof date === "object" && date.seconds) {
        return new Date(date.seconds * 1000).toLocaleString();
      } else if (!isNaN(Date.parse(date))) {
        return new Date(date).toLocaleString();
      } else {
        return "Invalid Date";
      }
    } catch (e) {
      return "N/A";
    }
  };

  return (
    <div className="customers-page">
      <h2>👤 Registered Customers</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>UID</th>
            <th>Email</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Created At</th>
            <th>Last Sign-In</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(customers) && customers.length > 0 ? (
            customers.map(user => (
              <tr key={user.uid}>
                <td>{user.uid}</td>
                <td>{user.email || "N/A"}</td>
                <td>{user.name || user.displayName || "N/A"}</td>
                <td>{user.phoneNumber || "N/A"}</td>
                <td>{formatDate(user.creationTime)}</td>
                <td>{formatDate(user.lastSignInTime)}</td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="6">No customers found.</td></tr>
          )}
        </tbody>
      </table>

      <h2 style={{ marginTop: "50px" }}>📦 Orders</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>User UID</th>
            <th>Product</th>
            <th>Total Price</th>
            <th>Order Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(orders) && orders.length > 0 ? (
            orders.map(order => (
              <tr key={order.orderId || order.id}>
                <td>{order.orderId || order.id || "N/A"}</td>
                <td>{order.uid || order.userId || "N/A"}</td>
                <td>{order.productName || "Unnamed Product"}</td>
                <td>₹{order.productPrice || order.total || 0}</td>
                <td>{formatDate(order.orderDate)}</td>
                <td>{order.status || "Processing"}</td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="6">No orders found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
