import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./CompleteOrder.css";

export default function CompleteOrder() {
  const { state } = useLocation();
  const navigate = useNavigate();

  return (
    <div className="complete-order">
      <h2>✅ Order Completed Successfully!</h2>
      <p><strong>Order ID:</strong> {state?.orderId}</p>
      <p><strong>Estimated Delivery:</strong> {state?.deliveryDate}</p>
      <p>Your order will be delivered within the next 4 days.</p>
      <button className="search-btn" onClick={() => navigate("/search")}>
        🔍 Go to Search
      </button>
    </div>
  );
}
