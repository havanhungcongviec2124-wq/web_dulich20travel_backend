const PricingRule = require("../models/pricingRule.model");
const DailyPrice = require("../models/dailyPrice.model");
const Service = require("../models/service.model");

// --- Rules ---
exports.listRules = async (req, res) => {
  try {
    const { serviceCode, packageId } = req.query;
    const filter = {};
    if (serviceCode) filter.serviceCode = serviceCode;
    if (packageId) filter.packageId = packageId;
    const items = await PricingRule.find(filter).sort({ serviceCode: 1, packageId: 1 });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: "Không thể tải quy tắc giá.", error: error.message });
  }
};

exports.upsertRule = async (req, res) => {
  try {
    const payload = req.body || {};
    const { serviceCode, packageId = "default" } = payload;
    if (!serviceCode) return res.status(400).json({ success: false, message: "Thiếu mã dịch vụ." });

    let item;
    if (payload._id || payload.id) {
      const id = payload._id || payload.id;
      item = await PricingRule.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    } else {
      item = await PricingRule.findOneAndUpdate(
        { serviceCode, packageId },
        { $set: payload },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
      );
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: "Không thể lưu quy tắc giá.", error: error.message });
  }
};

exports.updateRule = async (req, res) => {
  try {
    const item = await PricingRule.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: "Không tìm thấy quy tắc giá." });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: "Không thể cập nhật quy tắc giá.", error: error.message });
  }
};

exports.removeRule = async (req, res) => {
  try {
    const item = await PricingRule.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Không tìm thấy quy tắc giá." });
    res.json({ success: true, message: "Đã xóa quy tắc giá." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Không thể xóa quy tắc giá.", error: error.message });
  }
};

// --- Daily prices ---
exports.listDaily = async (req, res) => {
  try {
    const { serviceCode, packageId = "default", month, from, to } = req.query;
    const filter = {};
    if (serviceCode) filter.serviceCode = serviceCode;
    if (packageId) filter.packageId = packageId;
    if (month) {
      // month as YYYY-MM
      filter.date = { $regex: `^${month}` };
    } else if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = from;
      if (to) filter.date.$lte = to;
    }
    const items = await DailyPrice.find(filter).sort({ date: 1 });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: "Không thể tải giá theo ngày.", error: error.message });
  }
};

exports.upsertDaily = async (req, res) => {
  try {
    const body = req.body || {};
    const items = Array.isArray(body.items) ? body.items : [body];
    const results = [];
    for (const payload of items) {
      const { serviceCode, packageId = "default", date } = payload;
      if (!serviceCode || !date) continue;
      const doc = await DailyPrice.findOneAndUpdate(
        { serviceCode, packageId, date },
        { $set: { ...payload, serviceCode, packageId, date } },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
      );
      results.push(doc);
    }
    res.json({ success: true, data: results, count: results.length });
  } catch (error) {
    res.status(500).json({ success: false, message: "Không thể lưu giá theo ngày.", error: error.message });
  }
};

exports.updateDaily = async (req, res) => {
  try {
    const item = await DailyPrice.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: "Không tìm thấy giá ngày." });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: "Không thể cập nhật giá ngày.", error: error.message });
  }
};

exports.removeDaily = async (req, res) => {
  try {
    const item = await DailyPrice.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Không tìm thấy giá ngày." });
    res.json({ success: true, message: "Đã xóa giá ngày." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Không thể xóa giá ngày.", error: error.message });
  }
};

// Combined calendar info for a service/month (rule + daily overrides)
exports.calendar = async (req, res) => {
  try {
    const { serviceCode, month, packageId = "default" } = req.query;
    if (!serviceCode) return res.status(400).json({ success: false, message: "Thiếu serviceCode." });
    const [rule, daily] = await Promise.all([
      PricingRule.findOne({ serviceCode, packageId }),
      month ? DailyPrice.find({ serviceCode, packageId, date: { $regex: `^${month}` } }).sort({ date: 1 }) : DailyPrice.find({ serviceCode, packageId }).sort({ date: 1 }),
    ]);
    res.json({ success: true, data: { rule, daily } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Không thể tải lịch giá.", error: error.message });
  }
};
