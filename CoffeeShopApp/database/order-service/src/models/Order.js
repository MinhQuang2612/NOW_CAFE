const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    hoadon_id: { type: String, required: true },
    user: {
      user_id: { type: String, required: true },
      name: String,
      phoneNumber: String,
      address: String,
    },
    ChiTietHoaDon: {
      chitiethoadon_id: String,
      SanPham: [
        {
          productId: String,
          name: String,
          quantity: Number,
          price: Number,
          image: String,
        },
      ],
      dateCreated: Date,
    },
    tongTien: Number,
    status: String,
    paymentMethod: String,
  },
  { timestamps: true } // Tạo trường createdAt tự động
);

module.exports = mongoose.model('Order', OrderSchema, 'Orders'); 