const Location = require("../models/location.model");

exports.list = async (req, res) => {
  try {
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    const items = await Location.find(filter).sort({ order: 1, name: 1 });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: "Không thể tải địa điểm.", error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const item = await Location.create(req.body || {});
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: "Không thể tạo địa điểm.", error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await Location.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: "Không tìm thấy địa điểm." });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: "Không thể cập nhật địa điểm.", error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const item = await Location.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Không tìm thấy địa điểm." });
    res.json({ success: true, message: "Đã xóa địa điểm." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Không thể xóa địa điểm.", error: error.message });
  }
};
