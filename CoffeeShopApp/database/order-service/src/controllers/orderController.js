const Order = require('../models/Order');

// Lấy đơn hàng theo userId
exports.getOrdersByUserId = async (req, res) => {
  const { userId } = req.params;

  console.log("Fetching orders for userId:", userId);

  try {
    // Truy vấn tất cả các đơn hàng của người dùng theo userId
    const orders = await Order.find({ "user.user_id": userId }).sort({ createdAt: -1 });

    console.log("Orders found:", orders);

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: "Không có đơn hàng nào cho người dùng này." });
    }

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("❌ Lỗi khi lấy đơn hàng:", error);
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// Tạo đơn hàng mới
exports.createOrder = async (req, res) => {
  try {
    const { user, ChiTietHoaDon, paymentMethod, status } = req.body;

    // Tạo mã hóa đơn mới
    const date = new Date();
    const timestamp = date.getTime();
    const hoadon_id = `HD${timestamp}`;

    // Tính tổng tiền
    const tongTien = ChiTietHoaDon.SanPham.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    const newOrder = new Order({
      hoadon_id,
      user,
      ChiTietHoaDon: {
        ...ChiTietHoaDon,
        dateCreated: date,
        chitiethoadon_id: `CT${timestamp}`
      },
      tongTien,
      status: status || 'Đang xử lý',
      paymentMethod: paymentMethod || 'Tiền mặt',
    });

    const savedOrder = await newOrder.save();
    console.log("📝 Đơn hàng mới đã được tạo:", savedOrder);

    res.status(201).json({ success: true, order: savedOrder });
  } catch (error) {
    console.error("❌ Lỗi khi tạo đơn hàng:", error);
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// Lấy chi tiết đơn hàng theo ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ hoadon_id: req.params.orderId });
    
    if (!order) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
    }
    
    res.json({ success: true, order });
  } catch (error) {
    console.error("❌ Lỗi API:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// Cập nhật trạng thái đơn hàng
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin trạng thái" });
    }
    
    const updatedOrder = await Order.findOneAndUpdate(
      { hoadon_id: req.params.orderId },
      { $set: { status } },
      { new: true }
    );
    
    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
    }
    
    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("❌ Lỗi API:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// Lấy tất cả đơn hàng
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.error("❌ Lỗi API:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
}; 