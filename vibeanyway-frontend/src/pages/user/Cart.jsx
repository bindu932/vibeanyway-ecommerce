// src/pages/user/Cart.jsx
import React, { useEffect, useState } from "react";
import { db, auth } from "../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
} from "firebase/firestore";
import "./Cart.css";

import { useNavigate } from "react-router-dom";

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [feedback, setFeedback] = useState({});
  const navigate = useNavigate();

  const fetchCartAndWishlist = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const cartQuery = query(collection(db, "cart"), where("uid", "==", user.uid));
      const cartSnap = await getDocs(cartQuery);
      const cartItems = cartSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const uniqueItems = cartItems.filter(
        (item, index, self) => index === self.findIndex(t => t._id === item._id)
      );
      setCart(uniqueItems);

      const wishlistSnap = await getDocs(
        query(collection(db, "wishlist"), where("uid", "==", user.uid))
      );
      const ids = wishlistSnap.docs.map(doc => doc.data()._id);
      setWishlistIds(ids);
    } catch (err) {
      console.error("❌ Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchCartAndWishlist();
  }, []);

  const handleRemove = async (docId) => {
    try {
      await deleteDoc(doc(db, "cart", docId));
      setCart(prev => prev.filter(item => item.id !== docId));
      setFeedback(prev => ({ ...prev, [docId]: "❌ Removed from Cart" }));
    } catch (err) {
      console.error("❌ Remove Error:", err);
    }
  };

  const handleMoveToWishlist = async (item) => {
    const user = auth.currentUser;
    if (!user) return;

    if (wishlistIds.includes(item._id)) {
      setFeedback(prev => ({ ...prev, [item.id]: "✅ Already in Wishlist" }));
      return;
    }

    try {
      await addDoc(collection(db, "wishlist"), {
        uid: user.uid,
        _id: item._id,
        name: item.name,
        imageUrl: item.imageUrl,
        price: item.price,
        description: item.description || "",
        timestamp: Date.now(),
      });

      await deleteDoc(doc(db, "cart", item.id));
      setCart(prev => prev.filter(i => i.id !== item.id));
      setWishlistIds(prev => [...prev, item._id]);
      setFeedback(prev => ({ ...prev, [item.id]: "✅ Moved to Wishlist" }));
    } catch (err) {
      console.error("❌ Move to Wishlist Error:", err);
    }
  };

  const handleBuyNow = (item) => {
    navigate("/buy-now", { state: { product: item } });
  };

  return (
   <div className="cart-page">
  <div className="overlay"></div> 
    <div className="content-wrapper">

  <h2>🛒 Your Cart</h2>
      {cart.length === 0 ? (
        <p>No items in cart.</p>
      ) : (
        <div className="product-list">
          {cart.map(item => (
            <div key={item.id} className="product-card">
              <img src={item.imageUrl} alt={item.name} />
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <strong>₹{item.price}</strong>
              <div className="actions">
                <button onClick={() => handleRemove(item.id)}>❌ Remove</button>
                <button onClick={() => handleBuyNow(item)}>💳 Buy Now</button>
                <button onClick={() => handleMoveToWishlist(item)}>❤️ Move to Wishlist</button>
              </div>
              {feedback[item.id] && <p className="feedback">{feedback[item.id]}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
}
