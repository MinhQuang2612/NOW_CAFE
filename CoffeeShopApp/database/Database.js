require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Kết nối MongoDB
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI environment variable is not defined");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Định nghĩa Schema và Model
const AccountSchema = new mongoose.Schema({
  userName: String,
  passWord: String,
  userId: String,
});

const Account = mongoose.model("Account", AccountSchema, "Account");

app.post("/api/login", async (req, res) => {
  const { userName, passWord } = req.body;

  try {
    const user = await Account.findOne({ userName });

    console.log("🔍 Tìm User:", user);
    if (!user) {
      return res.status(401).json({ success: false, message: "Sai tài khoản" });
    }

    // Kiểm tra cả plain text và hash
    let isMatch = await bcrypt.compare(passWord, user.passWord);
    console.log("🔍 Kết quả so sánh với hash:", isMatch);

    if (!isMatch && user.passWord === passWord) {
      console.log("Sử dụng plain text match cho user:", userName);
      console.log("🔍 Plain text so sánh:", user.passWord, "===", passWord);
      isMatch = true;
    }

    console.log("🔍 Mật khẩu nhập vào:", passWord);
    console.log("🔍 Mật khẩu trong DB:", user.passWord);
    console.log("🔍 Kết quả so sánh cuối cùng:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Sai mật khẩu" });
    }

    res.json({ success: true, message: "Đăng nhập thành công", user });
  } catch (error) {
    console.error("❌ Lỗi API:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
});

// Định nghĩa Schema và Model cho sản phẩm
const ProductSchema = new mongoose.Schema({
  sanpham_id: String,
  name: String,
  price: Number,
  category: String,
  image: String,
  description: String,
  rate: Number,
  like: Number,
  quantity: Number,
});

const Product = mongoose.model("Product", ProductSchema, "Product");

// API lấy danh sách sản phẩm
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find({});
    console.log("📌 Dữ liệu từ MongoDB:", products);
    res.json(products);
  } catch (error) {
    console.error("❌ Lỗi API:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
});

// Định nghĩa Schema và Model cho collection user
const UserSchema = new mongoose.Schema({
  user_id: String,
  name: String,
  phoneNumber: String,
  address: String,
  points: Number,
  email: String,
});

const User = mongoose.model("User", UserSchema, "Users");

// Route để lấy thông tin người dùng theo userId từ collection User
app.get("/api/user/:userId", async (req, res) => {
  try {
    console.log("🔍 Gọi API với userId:", req.params.userId);

    const user = await User.findOne({ user_id: req.params.userId });

    console.log("📌 Kết quả từ MongoDB:", user);

    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("❌ Lỗi API:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
});

// Route để cập nhật thông tin người dùng
app.put("/api/user/:userId", async (req, res) => {
  try {
    console.log("🔍 Cập nhật người dùng với userId:", req.params.userId);
    console.log("Dữ liệu nhận được:", req.body);
    const updatedUser = await User.findOneAndUpdate(
      { user_id: req.params.userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    console.log("📌 Kết quả sau khi cập nhật:", updatedUser);
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
    }
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("❌ Lỗi API:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
});

// Định nghĩa Schema và Model cho collection Cart
const CartSchema = new mongoose.Schema({
  giohang_id: String,
  User: Object,
  SanPham: Array,
  totalPrice: Number,
});

const Cart = mongoose.model("Cart", CartSchema, "Cart");

// Route để lấy giỏ hàng theo userId từ collection Cart
app.get("/api/cart/:userId", async (req, res) => {
  try {
    console.log("🔍 Gọi API với userId:", req.params.userId);

    const cart = await Cart.findOne({ "User.User_id": req.params.userId });

    console.log("📌 Kết quả từ MongoDB:", cart);

    if (!cart) {
      return res.status(404).json({ success: false, message: "Không tìm thấy giỏ hàng" });
    }

    res.json({ success: true, cart });
  } catch (error) {
    console.error("❌ Lỗi API:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
});

// Route để cập nhật giỏ hàng
app.put("/api/cart/:userId", async (req, res) => {
  try {
    console.log("🔍 Cập nhật giỏ hàng với userId:", req.params.userId);
    console.log("Dữ liệu nhận được:", req.body);
    const updatedCart = await Cart.findOneAndUpdate(
      { "User.User_id": req.params.userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    console.log("📌 Kết quả sau khi cập nhật:", updatedCart);
    if (!updatedCart) {
      return res.status(404).json({ success: false, message: "Không tìm thấy giỏ hàng" });
    }
    res.json({ success: true, cart: updatedCart });
  } catch (error) {
    console.error("❌ Lỗi API:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
});

// Đổi mật khẩu
app.put("/api/change-password/:userId", async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.params.userId;

    console.log("Đã nhận request change-password với userId:", userId);

    const account = await Account.findOne({ userId });

    if (!account) {
      return res.status(404).json({ 
        success: false, 
        message: "Không tìm thấy tài khoản" 
      });
    }

    // Kiểm tra cả hash và plain text
    let isMatch = await bcrypt.compare(oldPassword, account.passWord);
    if (!isMatch && account.passWord === oldPassword) {
      console.log("Sử dụng plain text match cho userId:", userId);
      isMatch = true;
    }

    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: "Mật khẩu cũ không đúng" 
      });
    }

    // Hash mật khẩu mới trước khi lưu
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);
    account.passWord = hashedNewPassword;
    await account.save();

    res.json({ 
      success: true, 
      message: "Đổi mật khẩu thành công" 
    });
  } catch (error) {
    console.error("❌ Lỗi đổi mật khẩu:", error);
    res.status(500).json({ 
      success: false, 
      message: "Lỗi server", 
      error: error.message 
    });
  }
});

// Định nghĩa Schema và Model cho Voucher
const VoucherSchema = new mongoose.Schema({
  title: String,
  description: String,
  discount: Number,
  validFrom: Date,
  validTo: Date,
  minOrderValue: Number,
  isHighlighted: Boolean
});

const Voucher = mongoose.model("Voucher", VoucherSchema, "Voucher");

// API lấy danh sách voucher
app.get("/api/vouchers", async (req, res) => {
  try {
    const vouchers = await Voucher.find({});
    res.json(vouchers);
  } catch (error) {
    console.error("❌ Lỗi API Voucher:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
});

// API thêm voucher mới
app.post("/api/vouchers", async (req, res) => {
  const { title, description, discount, validFrom, validTo, minOrderValue, isHighlighted } = req.body;
  const newVoucher = new Voucher({
    title,
    description,
    discount,
    validFrom,
    validTo,
    minOrderValue,
    isHighlighted
  });
  try {
    const savedVoucher = await newVoucher.save();
    res.status(201).json(savedVoucher);
  } catch (error) {
    console.error("❌ Lỗi khi thêm voucher:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
});

// API cập nhật voucher theo ID
app.put("/api/vouchers/:id", async (req, res) => {
  try {
    const updatedVoucher = await Voucher.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedVoucher) {
      return res.status(404).json({ message: "Không tìm thấy voucher" });
    }
    res.json(updatedVoucher);
  } catch (error) {
    console.error("❌ Lỗi API Voucher:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
});

// API xóa voucher theo ID
app.delete("/api/vouchers/:id", async (req, res) => {
  try {
    const deletedVoucher = await Voucher.findByIdAndDelete(req.params.id);
    if (!deletedVoucher) {
      return res.status(404).json({ message: "Không tìm thấy voucher" });
    }
    res.json({ message: "Xóa voucher thành công" });
  } catch (error) {
    console.error("❌ Lỗi API Voucher:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
});


// Chạy server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));