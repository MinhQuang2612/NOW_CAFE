require('dotenv').config();

module.exports = {
  mongoUri: process.env.MONGO_URI || 'mongodb://mongo:27017/QuanLyQuanCafe',
  port: process.env.PORT || 5002,
}; 