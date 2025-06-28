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
import axios from "axios";
import "./Wishlist.css";
export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [cartIds, setCartIds] = useState([]);
  const [productsMap, setProductsMap] = useState({});
  const [feedback, setFeedback] = useState({});

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products");
      const productMap = {};
      res.data.forEach(p => (productMap[p._id] = p));
      setProductsMap(productMap);
    } catch (err) {
      console.error(" MongoDB Fetch Error:", err);
    }
  };

  const fetchWishlist = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const wishlistSnap = await getDocs(
        query(collection(db, "wishlist"), where("uid", "==", user.uid))
      );

      const validItems = [];
      for (const docSnap of wishlistSnap.docs) {
        const data = docSnap.data();
        if (productsMap[data._id]) {
          validItems.push({ id: docSnap.id, ...data });
        } else {
          await deleteDoc(doc(db, "wishlist", docSnap.id));
        }
      }
      setWishlist(validItems);

      const cartSnap = await getDocs(
        query(collection(db, "cart"), where("uid", "==", user.uid))
      );
      setCartIds(cartSnap.docs.map(doc => doc.data()._id));
    } catch (err) {
      console.error(" Wishlist Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (Object.keys(productsMap).length > 0) {
      fetchWishlist();
    }
  }, [productsMap]);

  const handleMoveToCart = async (item) => {
    const user = auth.currentUser;
    if (!user) return;

    if (cartIds.includes(item._id)) {
      setFeedback(prev => ({ ...prev, [item.id]: "✅Already in Cart" }));
      return;
    }

    try {
      await addDoc(collection(db, "cart"), {
        uid: user.uid,
        _id: item._id,
        name: item.name,
        imageUrl: item.imageUrl,
        price: item.price,
        description: item.description || "",
        timestamp: Date.now(),
      });

      await deleteDoc(doc(db, "wishlist", item.id));
      setWishlist(prev => prev.filter(i => i.id !== item.id));
      setCartIds(prev => [...prev, item._id]);
      setFeedback(prev => ({ ...prev, [item.id]: "✅ Moved to Cart" }));
    } catch (err) {
      console.error("❌ Move to Cart Error:", err);
    }
  };

  const handleRemove = async (id) => {
    try {
      await deleteDoc(doc(db, "wishlist", id));
      setWishlist(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error("❌ Remove from Wishlist Error:", err);
    }
  };

  return (
    <div className="wishlist-page">
      <h2>❤️ Your Wishlist</h2>
      {wishlist.length === 0 ? (
        <p>No valid items in wishlist.</p>
      ) : (
        <div className="product-list">
          {wishlist.map(item => (
            <div key={item.id} className="product-card">
              <img src={item.imageUrl} alt={item.name} />
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <strong>₹{item.price}</strong>
              <div className="actions">
                <button onClick={() => handleMoveToCart(item)}>🛒 Move to Cart</button>
                <button onClick={() => handleRemove(item.id)}>🗑️ Remove</button>
              </div>
              {feedback[item.id] && <p className="feedback">{feedback[item.id]}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
