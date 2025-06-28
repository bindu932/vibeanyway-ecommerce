const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config(); 

const productRoutes = require('./routes/product.route');
const userRoutes = require('./routes/user.route');       
const orderRoutes = require('./routes/order.route');


const app = express();

app.use(cors());
app.use(express.json()); 


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);         

app.use('/api/orders', orderRoutes);

app.get('/', (req, res) => {
  res.send(' API is running...');
});
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log(' MongoDB connected'))
.catch((err) => console.error('❌ MongoDB connection error:', err.message));


console.log(" S3_BUCKET_NAME from .env:", process.env.S3_BUCKET_NAME);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
