import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./BuyNow.css";

export default function BuyNow() {
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state?.product;

  if (!product) return <p>No product selected.</p>;

  return (
    <div className="buy-page">
      <h2 className="buy-heading">🛍️ Buy Now</h2>

      <div className="buy-product-card">
        <img src={product.imageUrl} alt={product.name} />
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <strong>₹{product.price}</strong>
      </div>

      <div className="buy-address-section">
        <input type="text" placeholder="🏠 House Number" />
        <div className="buy-row">
          <input type="text" placeholder="📍 Nearest Location" />
          <input type="text" placeholder="📞 Phone Number" />
        </div>
      </div>

      <button
        className="buy-button"
        onClick={() => navigate("/payment", { state: { product } })}
      >
        Proceed to Payment
      </button>
    </div>
  );
}
