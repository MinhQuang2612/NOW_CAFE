const Voucher = require('../models/Voucher');

// Lấy tất cả voucher
exports.getAllVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find({});
    res.json(vouchers);
  } catch (error) {
    console.error("❌ Lỗi API Voucher:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// Lấy voucher theo ID
exports.getVoucherById = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);
    
    if (!voucher) {
      return res.status(404).json({ success: false, message: "Không tìm thấy voucher" });
    }
    
    res.json({ success: true, voucher });
  } catch (error) {
    console.error("❌ Lỗi API:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// Thêm voucher mới
exports.createVoucher = async (req, res) => {
  const { title, description, discount, validFrom, validTo, minOrderValue, isHighlighted } = req.body;
  
  try {
    const newVoucher = new Voucher({
      title,
      description,
      discount,
      validFrom,
      validTo,
      minOrderValue,
      isHighlighted
    });
    
    const savedVoucher = await newVoucher.save();
    res.status(201).json({ success: true, voucher: savedVoucher });
  } catch (error) {
    console.error("❌ Lỗi khi thêm voucher:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// Cập nhật voucher
exports.updateVoucher = async (req, res) => {
  try {
    const updatedVoucher = await Voucher.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!updatedVoucher) {
      return res.status(404).json({ success: false, message: "Không tìm thấy voucher" });
    }
    
    res.json({ success: true, voucher: updatedVoucher });
  } catch (error) {
    console.error("❌ Lỗi API Voucher:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// Xóa voucher
exports.deleteVoucher = async (req, res) => {
  try {
    const deletedVoucher = await Voucher.findByIdAndDelete(req.params.id);
    
    if (!deletedVoucher) {
      return res.status(404).json({ success: false, message: "Không tìm thấy voucher" });
    }
    
    res.json({ success: true, message: "Xóa voucher thành công" });
  } catch (error) {
    console.error("❌ Lỗi API Voucher:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
}; 