const mongoose = require('mongoose');

const AccountGoogleSchema = new mongoose.Schema({
  googleID: { type: String, required: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  userId: { type: String, unique: true },
});

module.exports = mongoose.model('AccountGoogle', AccountGoogleSchema, 'AccountGoogle'); 