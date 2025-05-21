const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Lấy tất cả đơn hàng
router.get('/', orderController.getAllOrders);

// Lấy đơn hàng theo userId
router.get('/user/:userId', orderController.getOrdersByUserId);

// Lấy chi tiết một đơn hàng
router.get('/:orderId', orderController.getOrderById);

// Tạo đơn hàng mới
router.post('/', orderController.createOrder);

// Cập nhật trạng thái đơn hàng
router.put('/:orderId/status', orderController.updateOrderStatus);

module.exports = router; 