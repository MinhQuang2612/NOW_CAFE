const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { mongoUri, port } = require('./config');
const orderRoutes = require('./routes/orderRoutes');
const rateLimit = require('express-rate-limit');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  next();
});

// Giới hạn 10 request/phút cho mỗi IP cho các route API chính
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 phút
  max: 10,
  message: { success: false, message: "Bạn đã gửi quá nhiều yêu cầu, vui lòng thử lại sau!" }
});
app.use('/api/orders', apiLimiter);

// MongoDB Connection
mongoose.connect(mongoUri)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/orders', orderRoutes);

// Logging lỗi server
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Lỗi server:`, err);
  res.status(500).json({ success: false, message: "Lỗi server", error: err.message });
});

// Start Server
app.listen(port, () => console.log(`✅ Order Service running on port ${port}`)); 