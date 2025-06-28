import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import "./Profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [uid, setUid] = useState(null);

  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    pincode: "",
    district: "",
    state: "",
    country: "",
  });

  const [savedAddress, setSavedAddress] = useState({});
  const [editCount, setEditCount] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setUid(currentUser.uid);

        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setSavedAddress(data);
          setFormData({
            phone: data.phone || currentUser.phoneNumber || "",
            address: data.address || "",
            pincode: data.pincode || "",
            district: data.district || "",
            state: data.state || "",
            country: data.country || "",
          });
          setEditCount(data.editCount || 0);
        } else {
          setFormData((prev) => ({
            ...prev,
            phone: currentUser.phoneNumber || "",
          }));
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSaveAddress = async () => {
    if (!uid) return;

    const newEditCount = editCount + 1;

    const addressData = {
      ...formData,
      name: user?.displayName || "",
      email: user?.email || "",
      editCount: newEditCount,
      updatedAt: new Date(),
    };

    await setDoc(doc(db, "users", uid), addressData, { merge: true });
    setSavedAddress(addressData);
    setEditCount(newEditCount);
    alert("✅ Address saved successfully!");
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const logout = () => {
    auth.signOut();
    navigate("/login");
  };

  return (
    <div className="profile-page">
      <h1 className="profile-heading">👤 My Profile</h1>

      <div className="profile-container">
        <div className="profile-box">
          <h2>📄 Profile Details</h2>
          <p><strong>Name:</strong> {user?.displayName || savedAddress?.name || "Guest"}</p>
          <p><strong>Email:</strong> {user?.email || savedAddress?.email || "N/A"}</p>

          <div className="buttons">
            <button onClick={() => navigate("/orders")} className="btn blue">🧾 View Orders</button>
            <button onClick={() => navigate("/wishlist")} className="btn purple">💖 My Wishlist</button>
            <button onClick={logout} className="btn red">🔒 Logout</button>
          </div>
        </div>

        <div className="profile-box">
          <h2>🏡 Edit Address</h2>

          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Mobile Number"
          /><br />

          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Full Address"
          ></textarea><br />

          <input
            type="text"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            placeholder="Pincode"
          /><br />

          <input
            type="text"
            name="district"
            value={formData.district}
            onChange={handleChange}
            placeholder="District"
          /><br />

          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="State"
          /><br />

          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="Country"
          /><br />

          <button className="btn green" onClick={handleSaveAddress}>
            💾 Save Address
          </button>

          {savedAddress?.address && (
            <div className="saved-address">
              <p><strong>Saved Address:</strong></p>
              <p>📞 {savedAddress.phone}</p>
              <p>📍 {savedAddress.address}</p>
              <p>🏷️ {savedAddress.pincode}, {savedAddress.district}</p>
              <p>🌐 {savedAddress.state}, {savedAddress.country}</p>
              <p>🛠️ Edits: {editCount} times</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
