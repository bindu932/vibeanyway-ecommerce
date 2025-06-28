const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();

router.get("/firebase", async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection("orders").get();
    const orders = snapshot.docs.map(doc => ({
      _id: doc.id,
      ...doc.data()
    }));
    res.json({ success: true, orders });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ success: false, error: "Failed to fetch orders" });
  }
});

module.exports = router;
