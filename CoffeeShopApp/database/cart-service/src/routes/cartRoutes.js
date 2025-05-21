const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Lấy giỏ hàng theo userId
router.get('/:userId', cartController.getCartByUserId);

// Cập nhật giỏ hàng
router.put('/:userId', cartController.updateCart);

// Thêm sản phẩm vào giỏ hàng
router.post('/:userId/add', cartController.addToCart);

// Xóa sản phẩm khỏi giỏ hàng
router.delete('/:userId/remove/:productId', cartController.removeFromCart);

module.exports = router; 