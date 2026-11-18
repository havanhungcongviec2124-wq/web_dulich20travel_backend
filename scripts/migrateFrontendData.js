require("dotenv").config();

const mongoose = require("mongoose");
const path = require("path");
const connectDB = require("../config/config");

const User = require("../models/user.model");
const Category = require("../models/category.model");
const Location = require("../models/location.model");
const Consultant = require("../models/consultant.model");
const Service = require("../models/service.model");
const PricingRule = require("../models/pricingRule.model");
const DailyPrice = require("../models/dailyPrice.model");
const SiteContent = require("../models/siteContent.model");
const ActivityLog = require("../models/activityLog.model");

const safeStr = (v, fb = "") => (v == null ? fb : String(v));
const num = (v, fb = 0) => (Number.isFinite(Number(v)) ? Number(v) : fb);

async function main() {
  await connectDB();

  const fakePath = path.resolve(__dirname, "../../frontend/src/data/fake.data.js");
  const mockPath = path.resolve(__dirname, "../../frontend/src/data/mockData.js");
  const fake = await import(fakePath);
  const mock = await import(mockPath);

  const nowIso = new Date().toISOString();
  const today = nowIso.slice(0, 10);

  // --- Admin user ---
  const adminEmail = "admin@20travel.vn";
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: "Quản trị viên",
      email: adminEmail,
      password: "20travel2026",
      role: "admin",
      avatar: "/images/figma-consultant.jpg",
      active: true,
    });
  } else {
    // ensure password stays as demo if needed? don't overwrite hashed password unnecessarily
    if (!admin.avatar) { admin.avatar = "/images/figma-consultant.jpg"; await admin.save(); }
  }

  // --- Categories: union of fake + mock (fake is canonical for customer) ---
  // Backend uses key, mock uses id. fake categories: hotel, cruise-day, cruise-night, ticket, transport, tour
  // mock categories: hotel, cruise-day, cruise-night, ticket, transport (with slug/status)
  const fakeCats = fake.categories || [];
  const mockCats = mock.categories || [];
  const mockCatMap = new Map(mockCats.map((c) => [c.id, c]));
  const categoryDocs = fakeCats.map((c, i) => {
    const m = mockCatMap.get(c.id) || {};
    return {
      key: c.id,
      name: c.name,
      slug: m.slug || c.slug || `/${c.id}`,
      desc: c.desc || m.desc || "",
      unit: c.unit || m.unit || "dịch vụ",
      icon: c.icon || m.icon || "",
      image: c.image || "",
      count: num(c.count, num(m.count, 0)),
      status: m.status || "Bật",
      order: i + 1,
    };
  });
  // ensure any mock-only categories included
  for (const m of mockCats) {
    if (!categoryDocs.find((c) => c.key === m.id)) {
      categoryDocs.push({
        key: m.id, name: m.name, slug: m.slug || "", desc: "", unit: m.unit || "dịch vụ",
        icon: m.icon || "", image: "", count: num(m.count, 0), status: m.status || "Bật", order: categoryDocs.length + 1,
      });
    }
  }

  for (const c of categoryDocs) {
    await Category.findOneAndUpdate({ key: c.key }, { $set: c }, { upsert: true, new: true, setDefaultsOnInsert: true });
  }
  console.log(`Categories: ${categoryDocs.length}`);

  // --- Locations: from fake.destinations + fake.locations ---
  const dests = fake.destinations || [];
  const locs = fake.locations || [];
  const locMap = new Map();
  // destinations as type destination
  dests.forEach((d, i) => {
    locMap.set(`destination:${d.slug}`, {
      slug: d.slug, name: d.name, region: d.region || "", image: d.image || "", type: "destination", order: i + 1,
    });
  });
  // locations as type location (keep separate docs if same slug? different type allowed if unique on slug only -> conflict)
  // schema has unique slug, so merge: prefer richer info
  locs.forEach((l, i) => {
    const key = `any:${l.slug}`;
    const existing = locMap.get(`destination:${l.slug}`);
    if (existing) {
      existing.region = existing.region || l.region || "";
      existing.type = existing.type || "location";
    } else {
      locMap.set(key, { slug: l.slug, name: l.name, region: l.region || "", image: l.image || "", type: "location", order: 100 + i });
    }
  });
  const locationDocs = Array.from(locMap.values());
  for (const l of locationDocs) {
    await Location.findOneAndUpdate({ slug: l.slug }, { $set: l }, { upsert: true, new: true, setDefaultsOnInsert: true });
  }
  console.log(`Locations: ${locationDocs.length}`);

  // --- Consultants: merge fake.consultants + mock.consultants ---
  const fakeConsultants = fake.consultants || [];
  const mockConsultants = mock.consultants || [];
  const consultantMap = new Map();
  const normKey = (c) => c.id || c.key || safeStr(c.name).toLowerCase().replace(/\s+/g, "-");

  const upsertConsultant = (c, source, order) => {
    const key = normKey(c);
    const prev = consultantMap.get(key) || {};
    const merged = {
      key,
      name: c.name || prev.name,
      role: c.role || prev.role || "",
      specialty: c.specialty || c.note || prev.specialty || "",
      phone: c.phone || prev.phone || "",
      zalo: c.zalo || prev.zalo || "",
      facebook: c.facebook || prev.facebook || "",
      status: c.status || (c.active === false ? "Tạm ẩn" : "Hoạt động") || prev.status || "Hoạt động",
      active: typeof c.active === "boolean" ? c.active : (c.status ? c.status === "Hoạt động" : (prev.active !== false)),
      avatar: c.avatar || prev.avatar || "",
      tagline: c.tagline || c.desc || prev.tagline || "",
      image: c.image || prev.image || c.avatar || "",
      order: prev.order ?? order,
      _source: source,
    };
    consultantMap.set(key, merged);
  };
  fakeConsultants.forEach((c, i) => upsertConsultant(c, "fake", i + 1));
  mockConsultants.forEach((c, i) => upsertConsultant(c, "mock", 100 + i));
  const consultantDocs = Array.from(consultantMap.values()).map(({ _source, ...rest }) => rest);
  for (const c of consultantDocs) {
    await Consultant.findOneAndUpdate({ key: c.key }, { $set: c }, { upsert: true, new: true, setDefaultsOnInsert: true });
  }
  console.log(`Consultants: ${consultantDocs.length}`);

  // --- Services ---
  const fakeServices = fake.services || [];
  const mockServices = mock.services || [];
  const serviceMap = new Map(); // by slug
  const serviceByCode = new Map();
  const serviceByName = new Map();

  const catNameByKey = new Map(categoryDocs.map((c) => [c.key, c.name]));
  const normalizeCatName = (key) => catNameByKey.get(key) || key || "";

  const mapFakeService = (s) => ({
    code: s.code || s.id || "",
    slug: s.slug || s.id,
    name: s.name,
    subtitle: s.subtitle || "",
    category: s.category || "",
    categoryName: normalizeCatName(s.category),
    locationSlug: s.locationSlug || "",
    locationName: s.locationName || "",
    region: s.region || "",
    address: s.address || "",
    duration: s.duration || "",
    departure: s.departure || "",
    price: num(s.price, 0),
    weekendPrice: s.weekendPrice != null ? num(s.weekendPrice) : undefined,
    holidayPrice: s.holidayPrice != null ? num(s.holidayPrice) : undefined,
    fixedPrices: !!s.fixedPrices,
    priceUnit: s.priceUnit || "khách",
    marketPrice: num(s.marketPrice, 0),
    rating: num(s.rating, 4.8),
    reviews: num(s.reviews, 0),
    stars: num(s.stars, 0),
    image: s.image || "",
    secondaryImage: s.secondaryImage || "",
    gallery: Array.isArray(s.gallery) ? s.gallery : (s.image ? [s.image] : []),
    badge: s.badge || "",
    featuredBadge: s.featuredBadge || "",
    tag: s.tag || s.badge || "",
    summary: s.summary || "",
    summaryMobile: s.summaryMobile || "",
    overviewTitle: s.overviewTitle || "",
    roomType: s.roomType || "",
    ratingLabel: s.ratingLabel || "",
    tags: Array.isArray(s.tags) ? s.tags : [],
    amenities: Array.isArray(s.amenities) ? s.amenities : [],
    highlights: Array.isArray(s.highlights) ? s.highlights : [],
    included: Array.isArray(s.included) ? s.included : [],
    excluded: Array.isArray(s.excluded) ? s.excluded : [],
    notes: Array.isArray(s.notes) ? s.notes : [],
    options: Array.isArray(s.options) ? s.options : [],
    itinerary: Array.isArray(s.itinerary) ? s.itinerary : [],
    published: s.published !== false,
    status: s.status || "Hiển thị",
    featured: !!s.featured,
    updatedAt: s.updatedAt || today,
    consultantKey: s.consultantKey || "",
    guestStandard: s.guestStandard || "",
  });

  for (const s of fakeServices) {
    const doc = mapFakeService(s);
    if (!doc.slug) continue;
    serviceMap.set(doc.slug, doc);
    if (doc.code) serviceByCode.set(String(doc.code).toUpperCase(), doc);
    serviceByName.set(doc.name, doc);
  }

  const slugify = (str) => safeStr(str).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  // Merge/append mock services
  for (const s of mockServices) {
    // try to find duplicate in fake
    const byName = serviceByName.get(s.name);
    const code = safeStr(s.code || s.id).toUpperCase();
    if (byName) {
      // enrich existing
      byName.code = byName.code || code;
      byName.published = typeof s.published === "boolean" ? s.published : byName.published;
      byName.status = s.status || byName.status;
      byName.stars = byName.stars || num(s.stars, 0);
      byName.updatedAt = s.updatedAt || byName.updatedAt;
      byName.featured = byName.featured || !!s.featured;
      byName.secondaryImage = byName.secondaryImage || s.secondaryImage || "";
      byName.guestStandard = byName.guestStandard || s.guestStandard || "";
      byName.roomType = byName.roomType || s.roomType || "";
      byName.intro = byName.intro || s.intro || "";
      if ((!byName.tags || !byName.tags.length) && Array.isArray(s.amenities)) byName.tags = s.amenities;
      // keep reference for pricing mapping
      if (code) serviceByCode.set(code, byName);
      continue;
    }
    // new service from mock
    const slug = slugify(s.name) || safeStr(s.id);
    if (serviceMap.has(slug)) continue;
    const doc = {
      code,
      slug,
      name: s.name,
      subtitle: "",
      category: s.category || "",
      categoryName: s.categoryName || normalizeCatName(s.category),
      locationSlug: "",
      locationName: s.location || "",
      region: "",
      address: s.address || "",
      duration: "",
      departure: "",
      price: num(s.price, 0),
      fixedPrices: false,
      priceUnit: s.priceUnit || "khách",
      marketPrice: 0,
      rating: num(s.rating, 4.8),
      reviews: 0,
      stars: num(s.stars, 0),
      image: s.image || "",
      secondaryImage: s.secondaryImage || "",
      gallery: [s.image, s.secondaryImage].filter(Boolean),
      badge: s.featuredBadge || "",
      featuredBadge: s.featuredBadge || "",
      tag: s.tag || "",
      summary: s.description || s.intro || "",
      overviewTitle: s.intro || "",
      roomType: s.roomType || "",
      ratingLabel: s.tag || "",
      tags: Array.isArray(s.amenities) ? s.amenities : [],
      amenities: Array.isArray(s.amenitiesDetail) ? s.amenitiesDetail.map((l) => ({ icon: "check", label: l })) : [],
      highlights: [],
      included: [],
      excluded: [],
      notes: [],
      options: [],
      itinerary: [],
      published: typeof s.published === "boolean" ? s.published : true,
      status: s.status || "Hiển thị",
      featured: !!s.featured,
      updatedAt: s.updatedAt || today,
      consultantKey: "",
      guestStandard: s.guestStandard || "",
    };
    serviceMap.set(slug, doc);
    if (code) serviceByCode.set(code, doc);
    serviceByName.set(doc.name, doc);
  }

  const serviceDocs = Array.from(serviceMap.values());
  for (const s of serviceDocs) {
    await Service.findOneAndUpdate({ slug: s.slug }, { $set: s }, { upsert: true, new: true, setDefaultsOnInsert: true });
  }
  console.log(`Services: ${serviceDocs.length}`);

  // --- Pricing rules: from mockData.pricingRules (KS001) ---
  const pr = mock.pricingRules;
  const pricingRuleDocs = [];
  if (pr) {
    // attach to KS001 if exists, else to matching service? try to find by serviceCode
    const targetCode = pr.serviceCode || "KS001";
    // try to find a service with this code, else find by name
    let target = serviceByCode.get(targetCode.toUpperCase());
    if (!target && pr.serviceName) target = serviceByName.get(pr.serviceName);
    const code = target ? target.code : targetCode;
    const name = target ? target.name : (pr.serviceName || "");
    pricingRuleDocs.push({
      serviceCode: code, serviceName: name, packageId: "default", packageName: pr.packageName || "",
      weekday: pr.weekday || {}, weekend: pr.weekend || {}, lowSeason: pr.lowSeason || {}, holiday: pr.holiday || {},
      priorityNote: pr.priorityNote || "",
    });
    // also store under original KS001 code if different, so admin lookups by KS001 still work
    if (code !== targetCode) {
      pricingRuleDocs.push({
        serviceCode: targetCode, serviceName: name || pr.serviceName || "", packageId: "default", packageName: pr.packageName || "",
        weekday: pr.weekday || {}, weekend: pr.weekend || {}, lowSeason: pr.lowSeason || {}, holiday: pr.holiday || {},
        priorityNote: pr.priorityNote || "",
      });
    }
  }
  // also generate basic pricing rules from fake services that have fixed/weekend prices
  for (const s of serviceDocs) {
    if (!s.code) continue;
    if (pricingRuleDocs.find((r) => r.serviceCode === s.code)) continue;
    if (s.price || s.weekendPrice) {
      pricingRuleDocs.push({
        serviceCode: s.code, serviceName: s.name, packageId: "default", packageName: s.roomType || "Mặc định",
        weekday: { label: "Ngày thường", price: num(s.price), sub: "" },
        weekend: { label: "Cuối tuần", price: num(s.weekendPrice || s.price), sub: "" },
        lowSeason: { label: "Thấp điểm", price: Math.round(num(s.price) * 0.92), sub: "" },
        holiday: { label: "Lễ / Tết", price: num(s.holidayPrice || Math.round(num(s.price) * 1.3)), sub: "" },
        priorityNote: "Ưu tiên giá: Điều chỉnh theo ngày → Lễ/Tết → Thấp điểm → Cuối tuần → Ngày thường",
      });
    }
  }
  for (const r of pricingRuleDocs) {
    await PricingRule.findOneAndUpdate({ serviceCode: r.serviceCode, packageId: r.packageId || "default" }, { $set: r }, { upsert: true, new: true, setDefaultsOnInsert: true });
  }
  console.log(`PricingRules: ${pricingRuleDocs.length}`);

  // --- Daily prices: from mockData.november2026Calendar for KS001 (and mapped service) ---
  const cal = mock.november2026Calendar || [];
  const dailyDocs = [];
  if (cal.length) {
    const ksTarget = serviceByCode.get("KS001") || serviceByName.get("Vinpearl Resort & Spa Hạ Long");
    const codes = new Set(["KS001"]);
    if (ksTarget && ksTarget.code) codes.add(ksTarget.code);
    for (const code of codes) {
      for (const d of cal) {
        const day = String(d.day).padStart(2, "0");
        const date = `2026-11-${day}`;
        dailyDocs.push({
          serviceCode: code, packageId: "default", date,
          type: d.type === "weekend" ? "Cuối tuần" : d.type === "holiday" ? "Lễ / Tết" : d.type === "low" ? "Thấp điểm" : "Ngày thường",
          basePrice: num(d.price), finalPrice: num(d.price), adjust: 0, note: d.selected ? "Ngày được chọn mặc định" : "",
        });
      }
    }
  }
  for (const d of dailyDocs) {
    await DailyPrice.findOneAndUpdate({ serviceCode: d.serviceCode, packageId: d.packageId, date: d.date }, { $set: d }, { upsert: true, new: true, setDefaultsOnInsert: true });
  }
  console.log(`DailyPrices: ${dailyDocs.length}`);

  // --- Site content ---
  const fakeCompany = fake.company || {};
  const mockCompany = mock.company || {};
  const mergedCompany = {
    ...fakeCompany,
    ...mockCompany,
    // prefer explicit contact requirements and richer info
    brand: fakeCompany.brand || mockCompany.brand || "20 TRAVEL",
    tagline: fakeCompany.tagline || mockCompany.tagline || "",
    slogan: mockCompany.slogan || fakeCompany.slogan || "",
    desc: mockCompany.desc || fakeCompany.desc || "",
    hotline: fakeCompany.hotline || mockCompany.hotline || "036 271 5585",
    hotlineRaw: fakeCompany.hotlineRaw || mockCompany.hotlineRaw || "0362715585",
    facebook: fakeCompany.facebook || mockCompany.facebook || "http://facebook.com/hoangthiendll",
    zalo: fakeCompany.zalo || mockCompany.zalo || "https://zalo.me/0362715585",
    workingHours: fakeCompany.workingHours || mockCompany.workingHours || "08:00 – 21:00 (T2 – CN)",
    email: fakeCompany.email || mockCompany.email || "",
    address: fakeCompany.address || mockCompany.address || "",
  };

  const banners = [];
  if (mock.websiteBanner) {
    banners.push({ id: "BN001", ...mock.websiteBanner });
  }
  // include a second banner placeholder from admin content initial? (it's UI default, not in mock export except implied)
  banners.push({
    id: "BN002",
    title: "Mùa lễ hội trên vịnh Hạ Long",
    desc: "Combo du thuyền ngủ đêm và vé vui chơi, ưu đãi đến 25% cho khách đặt sớm.",
    buttonLabel: "Xem ưu đãi",
    buttonLink: "/dich-vu?category=cruise-night",
    image: "/images/ha-long.jpg",
    dimension: "Desktop 1440 x 490 • Thứ tự hiển thị: 02",
    status: "Đang ẩn",
  });

  const policies = [
    { id: "booking", title: "Chính sách đặt chỗ & thanh toán", content: "Khách hàng giữ chỗ trong 24 giờ kể từ khi nhận báo giá. Thanh toán trước tối thiểu 30% giá trị đơn hàng, phần còn lại thanh toán trước ngày khởi hành 3 ngày." },
    { id: "cancel", title: "Chính sách hủy & hoàn tiền", content: "Hủy trước 15 ngày: miễn phí. Hủy trước 7 ngày: phí 30%. Hủy trước 3 ngày: phí 50%. Hủy trong vòng 48 giờ: phí 100% giá trị dịch vụ." },
    { id: "general", title: "Điều khoản chung", content: "Giá dịch vụ có thể thay đổi theo ngày lễ, tết hoặc thời điểm cao điểm. 20 TRAVEL cam kết thông báo rõ ràng trước khi xác nhận đặt chỗ." },
  ];

  const info = {
    faqs: fake.faqs || [],
    priceTables: fake.priceTables || {},
    navLinks: fake.navLinks || [],
    holidays: fake.holidays || [],
    stats: fake.stats || [],
    testimonials: fake.testimonials || [],
    adminStats: mock.adminStats || {},
  };

  await SiteContent.findOneAndUpdate(
    { key: "main" },
    { $set: { key: "main", company: mergedCompany, banners, policies, info } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log("SiteContent: updated");

  // --- Activity logs ---
  const logs = (mock.activityLogs || []).map((l) => ({
    time: l.time || "",
    admin: l.admin || "",
    adminId: "",
    action: l.action || "",
    target: l.target || "",
    targetName: l.targetName || "",
    dateApplied: l.dateApplied || "",
    packageInfo: l.packageInfo || "",
    priceBefore: l.priceBefore ?? "—",
    priceAfter: l.priceAfter ?? "—",
    reason: l.reason || "",
    timestamp: l.timestamp || "",
    meta: { sourceId: l.id, selected: !!l.selected },
  }));
  // avoid duplicating on rerun: if same count and first matches, skip; else upsert by composite key
  for (const l of logs) {
    await ActivityLog.findOneAndUpdate(
      { action: l.action, target: l.target, targetName: l.targetName, timestamp: l.timestamp, admin: l.admin },
      { $setOnInsert: l },
      { upsert: true, new: true }
    );
  }
  console.log(`ActivityLogs: ${logs.length}`);

  // update category counts based on services
  const counts = await Service.aggregate([
    { $match: { published: { $ne: false } } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [c._id, c.count]));
  const allCats = await Category.find();
  for (const cat of allCats) {
    let c = countMap.get(cat.key) || 0;
    if (cat.key === "cruise") c = (countMap.get("cruise-day") || 0) + (countMap.get("cruise-night") || 0);
    if (cat.count !== c) { cat.count = c; await cat.save(); }
  }

  console.log("Migration completed successfully.");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
