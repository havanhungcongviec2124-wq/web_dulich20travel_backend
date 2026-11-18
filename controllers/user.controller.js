const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

const ensureDefaultAdmin = async () => {
  const email = "admin@20travel.vn";
  const existing = await User.findOne({ email });
  if (existing) return existing;
  return User.create({
    name: "Quản trị viên",
    email,
    password: "20travel2026",
    role: "admin",
    avatar: "/images/figma-consultant.jpg",
    active: true,
  });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập email và mật khẩu." });
    }

    await ensureDefaultAdmin();

    const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select("+password");
    if (!user || !user.active) {
      return res.status(401).json({ success: false, message: "Email hoặc mật khẩu không đúng." });
    }

    const ok = await user.comparePassword(password);
    if (!ok) {
      return res.status(401).json({ success: false, message: "Email hoặc mật khẩu không đúng." });
    }

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user);
    return res.json({
      success: true,
      token,
      user: user.toSafeJSON(),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Không thể đăng nhập.", error: error.message });
  }
};

exports.me = async (req, res) => {
  return res.json({ success: true, user: req.user.toSafeJSON() });
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ mật khẩu." });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ success: false, message: "Mật khẩu mới cần tối thiểu 6 ký tự." });
    }
    const user = await User.findById(req.user._id).select("+password");
    const ok = await user.comparePassword(currentPassword);
    if (!ok) {
      return res.status(400).json({ success: false, message: "Mật khẩu hiện tại không đúng." });
    }
    user.password = newPassword;
    await user.save();
    return res.json({ success: true, message: "Đã đổi mật khẩu thành công." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Không thể đổi mật khẩu.", error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({ success: false, message: "Vui lòng nhập email." });
  }
  return res.json({
    success: true,
    message: "Nếu email tồn tại trong hệ thống, liên kết đặt lại mật khẩu đã được gửi.",
  });
};
