import React, { useEffect, useState } from 'react';
import { auth, db } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import './Profile.css';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState({ name: '', email: '' });
  const [categories, setCategories] = useState([]);
  const [address, setAddress] = useState({
    doorNo: '',
    location: '',
    pincode: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setUserData({ name: currentUser.displayName || '', email: currentUser.email });

        // Fetch from Firestore only
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          if (data.address) setAddress(data.address);
          if (data.categories) setCategories(data.categories);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleCategoryClick = (category) => {
    if (!categories.includes(category)) {
      const updated = [...categories, category];
      setCategories(updated);
      saveData({ categories: updated });
      setMessage(`${category} added`);
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressSubmit = async () => {
    await saveData({ address });
    setMessage('Address saved successfully');
  };

  const saveData = async (dataToUpdate) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, dataToUpdate, { merge: true });
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        {user?.photoURL && <img className="profile-pic" src={user.photoURL} alt="Profile" />}
        <div>
          <h2>{userData.name}</h2>
          <p>{userData.email}</p>
        </div>
      </div>

      <div className="profile-section">
        <h3>Wish to Shop</h3>
        <div className="category-buttons">
          {['Trendy', 'Traditional', 'Party Wears', 'Casual Looks'].map((cat) => (
            <button key={cat} onClick={() => handleCategoryClick(cat)}>
              {cat} {categories.includes(cat) && '✔️'}
            </button>
          ))}
        </div>
      </div>

      <div className="profile-section">
        <h3>Edit Address</h3>
        <div className="address-form">
          <input
            name="doorNo"
            placeholder="Door No"
            value={address.doorNo}
            onChange={handleAddressChange}
          />
          <input
            name="location"
            placeholder="Nearest Location"
            value={address.location}
            onChange={handleAddressChange}
          />
          <input
            name="pincode"
            placeholder="Pincode"
            value={address.pincode}
            onChange={handleAddressChange}
          />
          <button onClick={handleAddressSubmit}>Submit</button>
        </div>
      </div>

      {message && <p className="success-message">{message}</p>}
    </div>
  );
}
