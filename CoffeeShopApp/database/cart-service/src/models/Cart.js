const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  giohang_id: String,
  User: {
    User_id: String
  },
  SanPham: Array,
  totalPrice: Number,
});

module.exports = mongoose.model('Cart', CartSchema, 'Cart'); 