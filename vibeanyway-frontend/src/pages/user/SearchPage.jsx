import { useEffect, useState } from "react";
import axios from "axios";
import "./SearchPage.css";
import { db, auth } from "../../firebase";
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
export default function SearchPage() {
  const [products, setProducts] = useState([]);
  const [queryText, setQueryText] = useState("");
  const [wishlistIds, setWishlistIds] = useState([]);
  const [cartIds, setCartIds] = useState([]);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/products");
        setProducts(res.data);
      } catch (err) {
        console.error(" Failed to fetch products:", err);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      const user = auth.currentUser;
      if (!user || products.length === 0) return;

      try {
        const [wishlistSnap, cartSnap] = await Promise.all([
          getDocs(query(collection(db, "wishlist"), where("uid", "==", user.uid))),
          getDocs(query(collection(db, "cart"), where("uid", "==", user.uid))),
        ]);

        const validProductIds = new Set(products.map((p) => p._id));

        const filteredWishlistIds = [];
        wishlistSnap.docs.forEach((docSnap) => {
          const data = docSnap.data();
          if (validProductIds.has(data._id)) {
            filteredWishlistIds.push(data._id);
          } else {
            deleteDoc(doc(db, "wishlist", docSnap.id));
          }
        });

        const filteredCartIds = [];
        cartSnap.docs.forEach((docSnap) => {
          const data = docSnap.data();
          if (validProductIds.has(data._id)) {
            filteredCartIds.push(data._id);
          } else {
            deleteDoc(doc(db, "cart", docSnap.id));
          }
        });

        setWishlistIds(filteredWishlistIds);
        setCartIds(filteredCartIds);
      } catch (err) {
        console.error(" Failed to load user wishlist/cart:", err);
      }
    };

    loadUserData();
  }, [products]);

  // Add to Wishlist
  const handleAddToWishlist = async (product) => {
    const user = auth.currentUser;
    if (!user) return;

    if (wishlistIds.includes(product._id)) return;

    try {
      await addDoc(collection(db, "wishlist"), {
        ...product,
        uid: user.uid,
        timestamp: Date.now(),
      });
      setWishlistIds((prev) => [...prev, product._id]);
    } catch (err) {
      console.error(" Add to wishlist failed:", err);
    }
  };

  // Add to Cart
  const handleAddToCart = async (product) => {
    const user = auth.currentUser;
    if (!user) return;

    if (cartIds.includes(product._id)) return;

    try {
      await addDoc(collection(db, "cart"), {
        ...product,
        uid: user.uid,
        timestamp: Date.now(),
      });
      setCartIds((prev) => [...prev, product._id]);
    } catch (err) {
      console.error(" Add to cart failed:", err);
    }
  };

  const filtered = products.filter((product) =>
    product.name?.toLowerCase().includes(queryText.toLowerCase())
  );

  return (
    <div className="search-page">
     <h2 className="search-heading">🔍 Search Products</h2>

      <input
        type="text"
        placeholder="Search by product name"
        value={queryText}
        onChange={(e) => setQueryText(e.target.value)}
        className="search-input"
      />

      <div className="product-list">
        {filtered.length > 0 ? (
          filtered.map((p) => {
            const isWishlisted = wishlistIds.includes(p._id);
            const isInCart = cartIds.includes(p._id);
            return (
              <div key={p._id} className="product-card">
                <img src={p.imageUrl} alt={p.name} />
                <h3>{p.name}</h3>
                <p>{p.description}</p>
                <p><strong>₹{p.price}</strong></p>

                <button
                  onClick={() => handleAddToWishlist(p)}
                  disabled={isWishlisted}
                >
                  {isWishlisted ? "❤️ Wishlisted" : "❤️ Add to Wishlist"}
                </button>

                <button
                  onClick={() => handleAddToCart(p)}
                  disabled={isInCart}
                >
                  {isInCart ? "🛒 In Cart" : "🛒 Add to Cart"}
                </button>
              </div>
            );
          })
        ) : (
          <p>No products found.</p>
        )}
      </div>
    </div>
  );
}
