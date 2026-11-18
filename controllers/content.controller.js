const SiteContent = require("../models/siteContent.model");

const getOrCreate = async (key = "main") => {
  let doc = await SiteContent.findOne({ key });
  if (!doc) doc = await SiteContent.create({ key, company: {}, banners: [], policies: [], info: {} });
  return doc;
};

exports.get = async (req, res) => {
  try {
    const doc = await getOrCreate(req.query.key || "main");
    res.json({ success: true, data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: "Không thể tải nội dung website.", error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const key = req.params.key || req.body?.key || "main";
    const doc = await getOrCreate(key);
    const payload = req.body || {};
    ["company", "banners", "policies", "info"].forEach((field) => {
      if (typeof payload[field] !== "undefined") doc[field] = payload[field];
    });
    if (typeof payload.set === "object" && payload.set) {
      Object.entries(payload.set).forEach(([k, v]) => {
        doc.set(k, v);
      });
    }
    await doc.save();
    res.json({ success: true, data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: "Không thể cập nhật nội dung.", error: error.message });
  }
};
