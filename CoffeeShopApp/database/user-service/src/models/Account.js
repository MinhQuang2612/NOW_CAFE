const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
  userName: String,
  passWord: String,
  userId: String,
});

module.exports = mongoose.model('Account', AccountSchema, 'Account'); 