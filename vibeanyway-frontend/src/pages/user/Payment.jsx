import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import { auth, db } from "../../firebase";
import { addDoc, collection } from "firebase/firestore";
import "./payment.css";

export default function Payment() {
  const { state } = useLocation();
  const product = state?.product;
  const navigate = useNavigate();

  const [showQR, setShowQR] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [address, setAddress] = useState("");
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);

  const handleScreenshot = (e) => {
    setScreenshot(e.target.files[0]);
  };

  const handleGenerateInvoice = async () => {
    if (!screenshot || !address) {
      alert("Please provide both address and payment screenshot.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert("Please login again.");
      return;
    }

    const orderId = "ORD" + Date.now();
    const username = user.displayName || user.email || user.phoneNumber;
    const orderDate = new Date();
    const deliveryDate = new Date();
    deliveryDate.setDate(orderDate.getDate() + 4);

    try {
      await addDoc(collection(db, "orders"), {
        uid: user.uid,
        username,
        orderId,
        productName: product.name,
        productPrice: product.price,
        productImage: product.imageUrl,
        productDescription: product.description,
        address,
        orderDate: orderDate.toISOString(),
        deliveryDate: deliveryDate.toISOString(),
        status: "Placed"
      });
    } catch (err) {
      console.error("Error saving order:", err);
      alert("Failed to save order. Please try again.");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Invoice", 20, 20);
    doc.setFontSize(12);
    doc.text(`Order ID: ${orderId}`, 20, 35);
    doc.text(`Customer Name: ${username}`, 20, 45);
    doc.text("Shipping Address:", 20, 55);
    doc.text(address, 30, 65);
    doc.text(`Order Date: ${orderDate.toDateString()}`, 20, 85);
    doc.text(`Expected Delivery: ${deliveryDate.toDateString()}`, 20, 95);
    doc.text("Product Details:", 20, 110);
    doc.text(`Name: ${product.name}`, 30, 120);
    doc.text(`Description: ${product.description}`, 30, 130);
    doc.text(`Price: ₹${product.price}`, 30, 140);
    doc.text("Thank you for shopping with VibeAnyway!", 20, 160);
    doc.save(`Invoice_${orderId}.pdf`);

    setInvoiceGenerated(true);

    navigate("/complete-order", {
      state: {
        orderId,
        deliveryDate: deliveryDate.toDateString()
      }
    });
  };

  return (
    <div className="payment-page">
      <h2 className="payment-heading">Payment Details</h2>

      <div className="payment-card">
        <img src={product.imageUrl} alt={product.name} />
        <h3>{product.name}</h3>
        <strong>₹{product.price}</strong>
      </div>

      <h4 className="payment-subtitle">Enter Shipping Address</h4>
      <textarea
        rows={4}
        placeholder="House No, City, State, Country, Phone"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      ></textarea>

      {!showQR ? (
        <button onClick={() => setShowQR(true)}>Show QR</button>
      ) : (
        <>
          <h4 className="payment-subtitle">Scan and Pay</h4>
          <img
            src="src/assets/QR.jpg"
            alt="QR Code"
            className="payment-qr"
          />
        </>
      )}

      <h4 className="payment-subtitle">Upload Payment Screenshot</h4>
      <input type="file" accept="image/*" onChange={handleScreenshot} />

      <button
        onClick={handleGenerateInvoice}
        disabled={!screenshot || !address}
      >
        Generate & Download Invoice
      </button>
    </div>
  );
}
