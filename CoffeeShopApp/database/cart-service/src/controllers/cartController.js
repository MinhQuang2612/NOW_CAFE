const Cart = require('../models/Cart');

// Lấy giỏ hàng theo userId
exports.getCartByUserId = async (req, res) => {
  try {
    console.log("🔍 Gọi API với userId:", req.params.userId);

    const cart = await Cart.findOne({ "User.User_id": req.params.userId });

    console.log("📌 Kết quả từ MongoDB:", cart);

    // Nếu không tìm thấy giỏ hàng, trả về giỏ hàng rỗng thay vì lỗi 404
    if (!cart) {
      return res.json({ cart: { SanPham: [], totalPrice: 0 } });
    }

    res.json({ cart });
  } catch (error) {
    console.error("❌ Lỗi API:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// Cập nhật giỏ hàng
exports.updateCart = async (req, res) => {
  try {
    console.log("🔍 Cập nhật giỏ hàng với userId:", req.params.userId);
    console.log("Dữ liệu nhận được:", req.body);

    const { SanPham } = req.body;

    // Tính tổng tiền
    const totalPrice = SanPham.reduce((sum, item) => sum + (item.price * item.quantity || 0), 0);

    // Tìm và cập nhật hoặc tạo mới giỏ hàng với upsert: true
    const updatedCart = await Cart.findOneAndUpdate(
      { "User.User_id": req.params.userId },
      {
        SanPham: SanPham || [],
        totalPrice: totalPrice,
        User: { User_id: req.params.userId }, // Đảm bảo User object có User_id
      },
      { upsert: true, new: true, runValidators: true }
    );

    console.log("📌 Kết quả sau khi cập nhật:", updatedCart);
    res.json({ cart: updatedCart });
  } catch (error) {
    console.error("❌ Lỗi API:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// Thêm sản phẩm vào giỏ hàng
exports.addToCart = async (req, res) => {
  try {
    const userId = req.params.userId;
    const productToAdd = req.body;

    console.log("🔍 Thêm sản phẩm vào giỏ hàng cho userId:", userId);
    console.log("Sản phẩm cần thêm:", productToAdd);

    // Kiểm tra giỏ hàng hiện tại
    let cart = await Cart.findOne({ "User.User_id": userId });

    if (!cart) {
      // Tạo giỏ hàng mới nếu chưa tồn tại
      cart = new Cart({
        User: { User_id: userId },
        SanPham: [productToAdd],
        totalPrice: productToAdd.price * productToAdd.quantity
      });
    } else {
      // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
      const existingProductIndex = cart.SanPham.findIndex(
        (item) => item.sanpham_id === productToAdd.sanpham_id
      );

      if (existingProductIndex !== -1) {
        // Nếu sản phẩm đã tồn tại, cập nhật số lượng
        cart.SanPham[existingProductIndex].quantity += productToAdd.quantity;
      } else {
        // Nếu là sản phẩm mới, thêm vào mảng SanPham
        cart.SanPham.push(productToAdd);
      }

      // Cập nhật tổng tiền
      cart.totalPrice = cart.SanPham.reduce(
        (total, item) => total + item.price * item.quantity, 0
      );
    }

    // Lưu giỏ hàng
    await cart.save();

    console.log("📌 Kết quả sau khi thêm sản phẩm:", cart);
    res.json({ success: true, cart });
  } catch (error) {
    console.error("❌ Lỗi API:", error);
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// Xóa sản phẩm khỏi giỏ hàng
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.params.userId;
    const productId = req.params.productId;

    console.log("🔍 Xóa sản phẩm khỏi giỏ hàng cho userId:", userId);
    console.log("Mã sản phẩm cần xóa:", productId);

    // Tìm giỏ hàng
    const cart = await Cart.findOne({ "User.User_id": userId });

    if (!cart) {
      return res.status(404).json({ success: false, message: "Không tìm thấy giỏ hàng" });
    }

    // Lọc bỏ sản phẩm cần xóa
    cart.SanPham = cart.SanPham.filter(item => item.sanpham_id !== productId);

    // Cập nhật tổng tiền
    cart.totalPrice = cart.SanPham.reduce(
      (total, item) => total + item.price * item.quantity, 0
    );

    // Lưu giỏ hàng
    await cart.save();

    console.log("📌 Kết quả sau khi xóa sản phẩm:", cart);
    res.json({ success: true, cart });
  } catch (error) {
    console.error("❌ Lỗi API:", error);
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
}; 