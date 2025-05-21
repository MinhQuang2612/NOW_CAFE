const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { mongoUri, port } = require('./config');
const productRoutes = require('./routes/productRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(mongoUri)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/products', productRoutes);

// Start Server
app.listen(port, () => console.log(`✅ Product Service running on port ${port}`)); 