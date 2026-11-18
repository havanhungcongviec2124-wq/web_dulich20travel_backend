const ActivityLog = require("../models/activityLog.model");

exports.list = async (req, res) => {
  try {
    const { action, admin, target, q, from, to, page = 1, limit = 100 } = req.query;
    const filter = {};
    if (action && action !== "all") filter.action = action;
    if (admin) filter.admin = admin;
    if (target) filter.target = target;
    if (q) {
      const rx = new RegExp(String(q).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ action: rx }, { target: rx }, { targetName: rx }, { admin: rx }, { reason: rx }];
    }
    if (from || to) {
      // timestamp stored as string in mock, but also createdAt exists; prefer createdAt range if ISO-like, else compare timestamp string
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(200, parseInt(limit, 10) || 100));
    const [items, total] = await Promise.all([
      ActivityLog.find(filter).sort({ createdAt: -1, _id: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
      ActivityLog.countDocuments(filter),
    ]);
    res.json({ success: true, data: items, total, page: pageNum, limit: limitNum });
  } catch (error) {
    res.status(500).json({ success: false, message: "Không thể tải lịch sử hoạt động.", error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const payload = req.body || {};
    if (!payload.action) return res.status(400).json({ success: false, message: "Thiếu hành động." });
    const now = new Date();
    if (!payload.timestamp) payload.timestamp = now.toISOString();
    if (!payload.time) {
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      const mo = String(now.getMonth() + 1).padStart(2, "0");
      payload.time = `${dd}/${mo} • ${hh}:${mm}`;
    }
    const item = await ActivityLog.create(payload);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: "Không thể ghi lịch sử.", error: error.message });
  }
};
