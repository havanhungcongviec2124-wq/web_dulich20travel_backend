const Service = require("../models/service.model");

const inBand = (price, band) => {
  if (!band) return true;
  const [min, max] = String(band).split("-").map(Number);
  if (!Number.isFinite(min) || !Number.isFinite(max)) return true;
  return price >= min && price < max;
};

exports.list = async (req, res) => {
  try {
    const {
      location,
      category,
      q,
      price,
      sort = "featured",
      featured,
      status,
      page = 1,
      limit = 100,
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (featured === "true") filter.featured = true;
    if (location) filter.locationSlug = location;
    if (category) {
      if (category === "cruise") filter.category = { $in: ["cruise-day", "cruise-night"] };
      else filter.category = category;
    }
    if (q) {
      const rx = new RegExp(String(q).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { name: rx },
        { code: rx },
        { slug: rx },
        { locationName: rx },
        { subtitle: rx },
        { tags: rx },
      ];
    }

    let items = await Service.find(filter).lean();

    if (price) {
      items = items.filter((s) => inBand(Number(s.price || 0), price));
    }

    if (sort === "price-asc") items.sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (sort === "price-desc") items.sort((a, b) => (b.price || 0) - (a.price || 0));
    else if (sort === "rating") items.sort((a, b) => (b.rating || 0) - (a.rating || 0) || (b.reviews || 0) - (a.reviews || 0));
    else items.sort((a, b) => Number(b.featured) - Number(a.featured) || (a.price || 0) - (b.price || 0));

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(200, parseInt(limit, 10) || 100));
    const total = items.length;
    const paged = items.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.json({ success: true, data: paged, total, page: pageNum, limit: limitNum });
  } catch (error) {
    res.status(500).json({ success: false, message: "Không thể tải danh sách dịch vụ.", error: error.message });
  }
};

exports.getBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const item = await Service.findOne({ $or: [{ slug }, { code: slug }] }).lean();
    if (!item) return res.status(404).json({ success: false, message: "Không tìm thấy dịch vụ." });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: "Không thể tải dịch vụ.", error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await Service.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ success: false, message: "Không tìm thấy dịch vụ." });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: "Không thể tải dịch vụ.", error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const payload = req.body || {};
    if (!payload.name || !payload.slug || !payload.category) {
      return res.status(400).json({ success: false, message: "Thiếu tên, slug hoặc danh mục." });
    }
    if (payload.price != null) payload.price = Number(payload.price) || 0;
    const item = await Service.create(payload);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: "Không thể tạo dịch vụ.", error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const payload = { ...(req.body || {}) };
    if (payload.price != null) payload.price = Number(payload.price) || 0;
    const item = await Service.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: "Không tìm thấy dịch vụ." });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: "Không thể cập nhật dịch vụ.", error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const item = await Service.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Không tìm thấy dịch vụ." });
    res.json({ success: true, message: "Đã xóa dịch vụ." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Không thể xóa dịch vụ.", error: error.message });
  }
};
