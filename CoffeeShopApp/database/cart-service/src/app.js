const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { mongoUri, port } = require('./config');
const cartRoutes = require('./routes/cartRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(mongoUri)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/cart', cartRoutes);

// Start Server
app.listen(port, () => console.log(`✅ Cart Service running on port ${port}`)); 