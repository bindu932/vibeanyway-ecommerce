const User = require("../models/user.model"); 

// Get All Users from MongoDB
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users from MongoDB
    res.status(200).json(users);
  } catch (err) {
    console.error("❌ Failed to fetch users:", err);
    res.status(500).json({ message: "❌ Failed to fetch users", error: err.message });
  }
};

module.exports = {
  getAllUsers,
};
