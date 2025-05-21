const Product = require('../models/Product');

// Lấy danh sách sản phẩm
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    console.log("📌 Dữ liệu từ MongoDB:", products);
    res.json(products);
  } catch (error) {
    console.error("❌ Lỗi API:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// Lấy sản phẩm theo ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ sanpham_id: req.params.productId });
    if (!product) {
      return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
    }
    res.json({ success: true, product });
  } catch (error) {
    console.error("❌ Lỗi API:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// Tạo sản phẩm mới
exports.createProduct = async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json({ success: true, product: savedProduct });
  } catch (error) {
    console.error("❌ Lỗi API:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// Cập nhật sản phẩm
exports.updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findOneAndUpdate(
      { sanpham_id: req.params.productId },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
    }
    res.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error("❌ Lỗi API:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// Xóa sản phẩm
exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findOneAndDelete({ sanpham_id: req.params.productId });
    if (!deletedProduct) {
      return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
    }
    res.json({ success: true, message: "Đã xóa sản phẩm thành công" });
  } catch (error) {
    console.error("❌ Lỗi API:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
}; 