const Category = require("../models/category.model");
const Service = require("../models/service.model");

const syncCategoryCounts = async () => {
  const counts = await Service.aggregate([
    { $match: { published: { $ne: false } } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);
  const map = new Map(counts.map((c) => [c._id, c.count]));
  const categories = await Category.find();
  await Promise.all(
    categories.map((cat) => {
      let count = map.get(cat.key) || 0;
      if (cat.key === "cruise") {
        count = (map.get("cruise-day") || 0) + (map.get("cruise-night") || 0);
      }
      if (cat.count !== count) {
        cat.count = count;
        return cat.save();
      }
      return null;
    })
  );
};

exports.list = async (req, res) => {
  try {
    await syncCategoryCounts().catch(() => {});
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const items = await Category.find(filter).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: "Không thể tải danh mục.", error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const payload = req.body || {};
    if (!payload.key || !payload.name) {
      return res.status(400).json({ success: false, message: "Thiếu mã hoặc tên danh mục." });
    }
    const item = await Category.create(payload);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: "Không thể tạo danh mục.", error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: "Không tìm thấy danh mục." });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: "Không thể cập nhật danh mục.", error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const item = await Category.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Không tìm thấy danh mục." });
    if ((item.count || 0) > 0) {
      return res.status(400).json({ success: false, message: "Danh mục còn dịch vụ, không thể xóa." });
    }
    await item.deleteOne();
    res.json({ success: true, message: "Đã xóa danh mục." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Không thể xóa danh mục.", error: error.message });
  }
};
