const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  user_id: String,
  name: String,
  phoneNumber: String,
  address: String,
  points: Number,
  email: String,
});

module.exports = mongoose.model('User', UserSchema, 'User'); 