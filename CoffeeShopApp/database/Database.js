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

//API đăng nhập tài khoản
app.post("/api/login", async (req, res) => {
  const { userName, passWord } = req.body;

  try {
    //Tìm user theo userName (KHÔNG tìm theo passWord)
    const user = await Account.findOne({ userName });

    if (!user) {
      return res.status(401).json({ success: false, message: "tài khoản hoặc mật khẩu chưa đăng ký..." });
    }
    //So sánh mật khẩu nhập vào với mật khẩu đã hash trong DB
    let isMatch = await bcrypt.compare(passWord,user.passWord);
    console.log("Mật khẩu nhập vào:", passWord);
    console.log("Mật khẩu trong DB:", user.passWord);
    console.log("Kết quả so sánh:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Sai mật khẩu" });
    } else{
      isMatch = true;
    }
    if (user.userName===req.body.userName) {
      isMatch = true;
    }else{
      isMatch = false;
    }
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Sai tài khoản" });
    }
    //Nếu đúng, trả về thành công
    res.json({ success: true, message: "Đăng nhập thành công", user });
  } catch (error) {
    console.error("❌ Lỗi API:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
});

const AccountGoogleSchema = new mongoose.Schema({
  googleID: { type: String, required: true },
  email: { type: String, required: true},
  name: { type: String, required: true },
  userId: { type: String, unique: true },
});

const AccountGoogle = mongoose.model("AccountGoogle", AccountGoogleSchema);
// API đăng nhập tài khoản Google
app.post("/api/auth/google", async (req, res) => {
  console.log("📩 Request body nhận được:", req.body);
  const { email, name, uid } = req.body;
  const googleID = uid;
  console.log("🔍 Google ID:", googleID);

  try {
    let user = await AccountGoogle.findOne({ googleID });

    if (!user) {
      const count = await AccountGoogle.countDocuments();
      const newUserId = `user${String(count + 1).padStart(4, "0")}`; // Sửa thành `user0001`
      user = new AccountGoogle({
        googleID: req.body.uid,
        email: req.body.gmail,
        name: req.body.username,
        userId: newUserId,
      });
      await user.save();
      console.log("🆕 Người dùng mới đã được tạo:", user);

      // Tạo bản ghi trong collection Users với định dạng userId mới
      const newUserInUsers = new User({
        user_id: newUserId, // Sử dụng newUserId
        name: req.body.username,
        email: req.body.gmail,
        phoneNumber: "",
        address: "",
        points: 0,
      });
      await newUserInUsers.save();
      console.log("🆕 Đã tạo user trong Users:", newUserInUsers);
    } else {
      console.log("✅ Người dùng đã tồn tại:", user);
    }

    res.json({ success: true, user, userId: user.userId });
  } catch (error) {
    console.error("❌ Lỗi xác thực Google:", error);
    res.status(401).json({ success: false, message: "Xác thực thất bại" });
  }
});

// định nghĩa accountFacebook
const AccountFacebookSchema = new mongoose.Schema({
  faceID: { type: String, required: true },
  email: { type: String, required: true},
  name: { type: String, required: true },
  userId: { type: String, unique: true },
});

const AccountFacebook = mongoose.model("AccountFacebook", AccountFacebookSchema);
// API đăng nhập tài khoản Facebook
app.post("/api/auth/facebook", async (req, res) => {
  console.log("📩 Request body nhận được:", req.body);
  const { email, username, uid } = req.body;
  const faceID = uid;
  console.log("🔍 Facebook ID:", faceID);

  try {
    let user = await AccountFacebook.findOne({ faceID });

    if (!user) {
      const count = await AccountFacebook.countDocuments();
      const newUserId = `user${String(count + 1).padStart(4, "0")}`; // Sửa thành `user0001`
      user = new AccountFacebook({
        faceID: req.body.uid,
        email: req.body.email,
        name: req.body.username,
        userId: newUserId,
      });
      await user.save();
      console.log("🆕 Người dùng mới đã được tạo:", user);

      // Tạo bản ghi trong collection Users với định dạng userId mới
      const newUserInUsers = new User({
        user_id: newUserId, // Sử dụng newUserId
        name: req.body.username,
        email: req.body.email,
        phoneNumber: "",
        address: "",
        points: 0,
      });
      await newUserInUsers.save();
      console.log("🆕 Đã tạo user trong Users:", newUserInUsers);
    }

    console.log("✅ Người dùng đã tồn tại:", user);
    res.json({ success: true, user, userId: user.userId });
  } catch (error) {
    console.error("❌ Lỗi xác thực Facebook:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
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

// Định nghĩa Schema và Model cho collection User
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

    // Nếu không tìm thấy giỏ hàng, trả về giỏ hàng rỗng thay vì lỗi 404
    if (!cart) {
      return res.json({ cart: { SanPham: [], totalPrice: 0 } });
    }

    res.json({ cart });
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

    const { SanPham } = req.body;

    // Tìm và cập nhật hoặc tạo mới giỏ hàng với upsert: true
    const updatedCart = await Cart.findOneAndUpdate(
      { "User.User_id": req.params.userId },
      {
        SanPham: SanPham || [],
        totalPrice: SanPham.reduce((sum, item) => sum + (item.price * item.quantity || 0), 0),
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

// Chạy server
// const PORT = process.env.PORT || 5001;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
const PORT = process.env.PORT || 5001;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
  });
}

module.exports = app;