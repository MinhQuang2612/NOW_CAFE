const mongoose = require('mongoose');

const VoucherSchema = new mongoose.Schema({
  title: String,
  description: String,
  discount: Number,
  validFrom: Date,
  validTo: Date,
  minOrderValue: Number,
  isHighlighted: Boolean
});

module.exports = mongoose.model('Voucher', VoucherSchema, 'Voucher'); 