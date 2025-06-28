import { useEffect, useState } from "react";
import { db, auth } from "../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import "./Order.css";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelBox, setShowCancelBox] = useState(null);

  const user = auth.currentUser;

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      const q = query(collection(db, "orders"), where("uid", "==", user.uid));
      const snap = await getDocs(q);
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(data);
    };

    fetchOrders();
  }, [user]);

  const handleCancelOrder = async (orderId) => {
    if (!cancelReason) return alert("Please provide a cancellation reason.");

    await updateDoc(doc(db, "orders", orderId), {
      status: "Cancelled",
      cancelReason,
    });

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: "Cancelled", cancelReason } : o
      )
    );
    setShowCancelBox(null);
    setCancelReason("");
  };

  const handleEditOrder = async (orderId) => {
    const newAddress = prompt("Enter new address:");
    const newDate = prompt("Enter new delivery date (YYYY-MM-DD):");

    if (newAddress && newDate) {
      await updateDoc(doc(db, "orders", orderId), {
        address: newAddress,
        deliveryDate: newDate,
      });
      alert("Order updated.");
    }
  };

  return (
    <div className="order-page">
      <h2 className="order-heading">Your Orders</h2>

      <div className="order-wrapper">
        {orders.length === 0 ? (
          <p className="order-empty">No orders yet.</p>
        ) : (
          <div className="order-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <img
                  src={order.productImage}
                  alt={order.productName}
                  className="order-img"
                />
                <h3 className="order-title">{order.productName}</h3>
                <p className="order-price">₹{order.productPrice}</p>
                <p className="order-status">
                  <strong>Status:</strong> {order.status || "Placed"}
                </p>
                <p className="order-address">
                  <strong>Address:</strong> {order.address}
                </p>
                <p className="order-date">
                  <strong>Delivery Date:</strong>{" "}
                  {new Date(order.deliveryDate).toDateString()}
                </p>

                {order.status !== "Cancelled" && (
                  <div className="order-actions">
                    <button
                      onClick={() => setShowCancelBox(order.id)}
                      className="order-btn cancel"
                    >
                      Cancel Order
                    </button>
                    <button
                      onClick={() => handleEditOrder(order.id)}
                      className="order-btn edit"
                    >
                      Edit Order
                    </button>
                    <button
                      onClick={() =>
                        (window.location.href = "mailto:support@example.com")
                      }
                      className="order-btn chat"
                    >
                      Chat / Help
                    </button>
                  </div>
                )}

                {showCancelBox === order.id && (
                  <div className="order-cancel-box">
                    <select
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="order-reason-select"
                    >
                      <option value="">Select Reason</option>
                      <option value="Ordered by mistake">Ordered by mistake</option>
                      <option value="Found cheaper elsewhere">Found cheaper elsewhere</option>
                      <option value="Delivery too slow">Delivery too slow</option>
                      <option value="Other">Other</option>
                    </select>
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="order-btn confirm"
                    >
                      Confirm Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
