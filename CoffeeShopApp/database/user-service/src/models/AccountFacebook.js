const mongoose = require('mongoose');

const AccountFacebookSchema = new mongoose.Schema({
  faceID: { type: String, required: true },
  email: { type: String, required: true},
  name: { type: String, required: true },
  userId: { type: String, unique: true },
});

module.exports = mongoose.model('AccountFacebook', AccountFacebookSchema, 'AccountFacebook'); 