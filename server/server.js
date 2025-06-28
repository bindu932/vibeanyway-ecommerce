const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config(); // Load environment variables from .env

const productRoutes = require('./routes/product.route');
const userRoutes = require('./routes/user.route');       // Includes firebase routes
const orderRoutes = require('./routes/order.route');
// Remove profileRoutes if profile logic is already in user.route
// const profileRoutes = require('./routes/profile.route');

const app = express();

// ✅ Middlewares
app.use(cors());
app.use(express.json()); // To parse JSON bodies

// ✅ Serve static files (optional - if you save files locally)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ API Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);         // ✅ Includes all user & firebase routes
// app.use('/api/users/profile', profileRoutes); // ❌ Comment this if duplicate logic exists
app.use('/api/orders', orderRoutes);

// ✅ Health Check Route
app.get('/', (req, res) => {
  res.send('🟢 API is running...');
});

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => console.error('❌ MongoDB connection error:', err.message));

// ✅ Print Bucket for verification
console.log("✅ S3_BUCKET_NAME from .env:", process.env.S3_BUCKET_NAME);

// ✅ Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
