const Consultant = require("../models/consultant.model");

exports.list = async (req, res) => {
  try {
    const filter = {};
    if (req.query.active === "true") filter.active = true;
    const items = await Consultant.find(filter).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: "Không thể tải nhân viên tư vấn.", error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const payload = req.body || {};
    if (!payload.name) return res.status(400).json({ success: false, message: "Thiếu tên nhân viên." });
    if (typeof payload.active === "undefined" && payload.status) {
      payload.active = payload.status === "Hoạt động";
    }
    const item = await Consultant.create(payload);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: "Không thể tạo nhân viên.", error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const payload = { ...(req.body || {}) };
    if (typeof payload.active === "undefined" && payload.status) {
      payload.active = payload.status === "Hoạt động";
    }
    const item = await Consultant.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: "Không tìm thấy nhân viên." });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: "Không thể cập nhật nhân viên.", error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const item = await Consultant.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Không tìm thấy nhân viên." });
    res.json({ success: true, message: "Đã xóa nhân viên." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Không thể xóa nhân viên.", error: error.message });
  }
};
