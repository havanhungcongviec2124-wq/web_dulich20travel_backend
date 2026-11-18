const Service = require("../models/service.model");
const Category = require("../models/category.model");
const Consultant = require("../models/consultant.model");
const ActivityLog = require("../models/activityLog.model");
const PricingRule = require("../models/pricingRule.model");
const DailyPrice = require("../models/dailyPrice.model");

exports.stats = async (req, res) => {
  try {
    const [
      totalServices,
      visibleServices,
      categories,
      consultants,
      activeConsultants,
      pricingRulesCount,
      dailyPricesCount,
      recentLogs,
    ] = await Promise.all([
      Service.countDocuments(),
      Service.countDocuments({ published: { $ne: false }, status: { $nin: ["Ẩn", "Bản nháp"] } }),
      Category.find().sort({ order: 1, createdAt: 1 }).lean(),
      Consultant.countDocuments(),
      Consultant.countDocuments({ active: { $ne: false }, status: { $ne: "Tạm ẩn" } }),
      PricingRule.countDocuments(),
      DailyPrice.countDocuments(),
      ActivityLog.find().sort({ createdAt: -1 }).limit(8).lean(),
    ]);

    // category breakdown with counts from services
    const svcCounts = await Service.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]);
    const countMap = new Map(svcCounts.map((c) => [c._id, c.count]));
    const cruiseCount = (countMap.get("cruise-day") || 0) + (countMap.get("cruise-night") || 0) + (countMap.get("cruise") || 0);
    const breakdown = categories.map((c) => {
      let count = countMap.get(c.key) || c.count || 0;
      if (c.key === "cruise") count = cruiseCount || count;
      return { key: c.key, name: c.name, count };
    });
    const maxCount = Math.max(1, ...breakdown.map((b) => b.count));
    breakdown.forEach((b) => (b.max = maxCount));

    // simple weekly trend from recent logs/services created (fallback synthetic)
    const now = new Date();
    const weeks = [];
    for (let i = 7; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(now.getDate() - i * 7);
      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      const value = await ActivityLog.countDocuments({ createdAt: { $gte: start, $lt: end } }).catch(() => 0);
      weeks.push({ week: `T${8 - i}`, value });
    }
    const maxWeek = Math.max(1, ...weeks.map((w) => w.value));
    weeks.forEach((w) => (w.isMax = w.value === maxWeek));

    const needPriceUpdate = Math.max(0, totalServices - pricingRulesCount);

    res.json({
      success: true,
      data: {
        totals: {
          services: totalServices,
          visibleServices,
          categories: categories.length,
          consultants,
          activeConsultants,
          pricingRules: pricingRulesCount,
          dailyPrices: dailyPricesCount,
        },
        needPriceUpdate,
        needPriceUpdateNote: `${needPriceUpdate} dịch vụ chưa có quy tắc giá`,
        categoryBreakdown: breakdown,
        weeklyTrend: weeks,
        recentLogs,
        // compatibility fields with mock adminStats
        totalServices,
        activePrices: pricingRulesCount,
        totalConsultants: consultants,
        activeConsultants,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Không thể tải thống kê.", error: error.message });
  }
};
