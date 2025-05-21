const Account = require('../models/Account');
const AccountGoogle = require('../models/AccountGoogle');
const AccountFacebook = require('../models/AccountFacebook');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const OTP = require('../OTP/index');

// Đăng nhập thường
exports.login = async (req, res) => {
  const { userName, passWord } = req.body;
  try {
    const user = await Account.findOne({ userName });
    if (!user) return res.status(401).json({ success: false, message: "Tài khoản không tồn tại" });
    const isMatch = await bcrypt.compare(passWord, user.passWord);
    if (!isMatch) return res.status(401).json({ success: false, message: "Sai mật khẩu" });
    res.json({ success: true, message: "Đăng nhập thành công", user });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// Đăng nhập Google
exports.loginGoogle = async (req, res) => {
  const { email, name, uid } = req.body;
  try {
    let user = await AccountGoogle.findOne({ googleID: uid });
    if (!user) {
      // Tạo userId mới
      const lastUser = await AccountGoogle.findOne().sort({ userId: -1 });
      let count = 0;
      if (lastUser && lastUser.userId) {
        const match = lastUser.userId.match(/\d+$/);
        count = match ? parseInt(match[0]) : 0;
      }
      const newUserId = `user${String(count + 1).padStart(4, "0")}`;
      user = new AccountGoogle({
        googleID: uid,
        email: email.toLowerCase().trim(),
        name,
        userId: newUserId,
      });
      await user.save();
      // Tạo user trong collection User
      const newUserInUsers = new User({
        user_id: newUserId,
        name,
        email: email.toLowerCase().trim(),
        phoneNumber: "",
        address: "",
        points: 0,
      });
      await newUserInUsers.save();
    }
    res.json({ success: true, user, userId: user.userId });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error });
  }
};

// Đăng nhập Facebook
exports.loginFacebook = async (req, res) => {
  const { email, name, uid } = req.body;
  try {
    let user = await AccountFacebook.findOne({ faceID: uid });
    if (!user) {
      const count = await AccountFacebook.countDocuments();
      const newUserId = `user${String(count + 1).padStart(4, "0")}`;
      user = new AccountFacebook({
        faceID: uid,
        email,
        name,
        userId: newUserId,
      });
      await user.save();
      // Tạo user trong collection User
      const newUserInUsers = new User({
        user_id: newUserId,
        name,
        email,
        phoneNumber: "",
        address: "",
        points: 0,
      });
      await newUserInUsers.save();
    }
    res.json({ success: true, user, userId: user.userId });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error });
  }
};

// Lấy thông tin user theo userId
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ user_id: userId }).select('-password'); // loại bỏ trường nhạy cảm nếu có

    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Lỗi getUserById:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};


// Cập nhật thông tin user
exports.updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { user_id: req.params.userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updatedUser) return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// Đổi mật khẩu
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.params.userId;
    const account = await Account.findOne({ userId });
    if (!account) return res.status(404).json({ success: false, message: "Không tìm thấy tài khoản" });
    let isMatch = await bcrypt.compare(oldPassword, account.passWord);
    if (!isMatch && account.passWord === oldPassword) isMatch = true;
    if (!isMatch) return res.status(401).json({ success: false, message: "Mật khẩu cũ không đúng" });
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);
    account.passWord = hashedNewPassword;
    await account.save();
    res.json({ success: true, message: "Đổi mật khẩu thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
}; 

exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Thiếu địa chỉ email' });
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Tạo OTP ngẫu nhiên
  try {
    await OTP.sendOtpEmail(email, otp);
    res.status(200).json({ message: 'Gửi OTP thành công', otp });
  } catch (error) {
    res.status(500).json({ message: 'Gửi OTP thất bại', error: error.message });
  }
};

exports.createAcount = async (req, res) => {
  const { userName, passWord, email, phone } = req.body;
  try {
    const count = await User.countDocuments();
    let newUserId;
    if (count == 0) {
      newUserId = `user0001`;
    } else {
      newUserId = `user${String(count + 1).padStart(4, "0")}`;
    }
    // Tạo user
    const user = new User({
      user_id: newUserId,
      name: userName,
      email: email,
      phoneNumber: phone,
      address: "",
      points: 0
    });
    await user.save();
    if (!user) return res.status(400).json({ success: false, message: "Tạo người dùng thất bại" });

    // Tạo tài khoản
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(passWord, salt);
    const account = new Account({
      userName: userName,
      passWord: hashedPassword,
      userId: newUserId
    });
    await account.save();
    if (!account) return res.status(400).json({ success: false, message: "Tạo tài khoản thất bại" });

    res.status(201).json({ success: true, account });

  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error });
  }
};

exports.checkAccount = async (req, res) => {
  const {email,username} = req.body;
  try {
    const account = await Account.findOne({ userName: username });
    if (!account) return res.status(404).json({ success: false, message: "Tài khoản không tồn tại" });
    const user = await User.findOne({ user_id: account.userId });
    if (!user) return res.status(404).json({ success: false, message: "Người dùng không tồn tại" });
    if (user.email !== email) return res.status(401).json({ success: false, message: "Email không đúng" });
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Tạo OTP ngẫu nhiên
    await OTP.sendOtpEmail(email, otp);
    res.status(200).json({ success: true, message: "Gửi OTP thành công", otp });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error });
  }
};

exports.resetPassword = async (req, res) => {
  const { username, newPassword } = req.body;
  if (!username || !newPassword) {
    return res.status(400).json({ success: false, message: "Thiếu thông tin" });
  }
  try {
    const account = await Account.findOne({ userName: username });
    if (!account) {
      return res.status(404).json({ success: false, message: "Tài khoản không tồn tại" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    account.passWord = hashedPassword;
    await account.save();
    res.status(200).json({ success: true, message: "Đặt lại mật khẩu thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error });
  }
};

