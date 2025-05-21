const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Lấy tất cả sản phẩm
router.get('/', productController.getAllProducts);

// Lấy sản phẩm theo ID
router.get('/:productId', productController.getProductById);

// Tạo sản phẩm mới
router.post('/', productController.createProduct);

// Cập nhật sản phẩm
router.put('/:productId', productController.updateProduct);

// Xóa sản phẩm
router.delete('/:productId', productController.deleteProduct);

module.exports = router; 