
const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    default: "",
  },
  photoURL: {
    type: String,
    default: "",
  },
  name: {
    type: String,
    default: "Guest",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Profile', profileSchema);
