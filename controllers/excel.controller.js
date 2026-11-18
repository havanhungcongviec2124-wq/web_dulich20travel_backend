const XLSX = require("xlsx");
const Service = require("../models/service.model");
const PricingRule = require("../models/pricingRule.model");
const DailyPrice = require("../models/dailyPrice.model");

const toDateStr = (v) => {
  if (!v) return "";
  if (v instanceof Date && !isNaN(v)) return v.toISOString().slice(0, 10);
  const s = String(v).trim();
  // dd/mm/yyyy
  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  // yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (!isNaN(d)) return d.toISOString().slice(0, 10);
  return s;
};

const isValidDate = (s) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !isNaN(d) && d.toISOString().slice(0, 10) === s;
};

exports.exportData = async (req, res) => {
  try {
    const { type = "services" } = req.query;
    let rows = [];
    let sheetName = "Data";

    if (type === "services") {
      const items = await Service.find().sort({ category: 1, name: 1 }).lean();
      sheetName = "Services";
      rows = items.map((s) => ({
        code: s.code || "",
        slug: s.slug || "",
        name: s.name || "",
        category: s.category || "",
        locationName: s.locationName || "",
        price: s.price || 0,
        priceUnit: s.priceUnit || "khách",
        status: s.status || (s.published ? "Hiển thị" : "Ẩn"),
        updatedAt: s.updatedAtLabel || (s.updatedAt ? new Date(s.updatedAt).toISOString().slice(0, 10) : ""),
      }));
    } else if (type === "pricing-rules") {
      const items = await PricingRule.find().sort({ serviceCode: 1 }).lean();
      sheetName = "PricingRules";
      rows = items.map((r) => ({
        serviceCode: r.serviceCode,
        serviceName: r.serviceName || "",
        packageId: r.packageId || "default",
        packageName: r.packageName || "",
        weekday: r.weekday?.price ?? "",
        weekend: r.weekend?.price ?? "",
        lowSeason: r.lowSeason?.price ?? "",
        holiday: r.holiday?.price ?? "",
      }));
    } else if (type === "daily-prices") {
      const items = await DailyPrice.find().sort({ serviceCode: 1, date: 1 }).lean();
      sheetName = "DailyPrices";
      rows = items.map((d) => ({
        serviceCode: d.serviceCode,
        packageId: d.packageId || "default",
        date: d.date,
        type: d.type || "",
        basePrice: d.basePrice || 0,
        finalPrice: d.finalPrice || 0,
        note: d.note || "",
      }));
    } else {
      return res.status(400).json({ success: false, message: "Loại export không hợp lệ." });
    }

    const ws = XLSX.utils.json_to_sheet(rows.length ? rows : [{}]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    const filename = `${type}-${new Date().toISOString().slice(0, 10)}.xlsx`;
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.send(buf);
  } catch (error) {
    res.status(500).json({ success: false, message: "Không thể export Excel.", error: error.message });
  }
};

exports.importData = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "Vui lòng chọn file Excel." });
    const commit = String(req.query.commit || req.body?.commit || "false") === "true";
    const type = String(req.query.type || req.body?.type || "daily-prices");

    const wb = XLSX.read(req.file.buffer, { type: "buffer", cellDates: true });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    const results = [];
    let validRows = 0;
    let errorRows = 0;

    if (type === "daily-prices") {
      const codes = await Service.distinct("code");
      const slugs = await Service.distinct("slug");
      const codeSet = new Set([...codes.filter(Boolean), ...slugs.filter(Boolean)]);

      for (let i = 0; i < rawRows.length; i++) {
        const r = rawRows[i];
        const rowNum = i + 2; // header is 1
        const serviceCode = String(r.serviceCode || r.code || r.ma || r["Mã dịch vụ"] || "").trim();
        const date = toDateStr(r.date || r.ngay || r["Ngày"]);
        const priceVal = r.finalPrice ?? r.price ?? r.gia ?? r["Giá"];
        const finalPrice = Number(String(priceVal).replace(/[^\d.-]/g, ""));
        const packageId = String(r.packageId || r.package || "default").trim() || "default";
        const typeLabel = String(r.type || r.loai || "").trim();
        const note = String(r.note || r.ghiChu || "").trim();

        const errors = [];
        if (!serviceCode) errors.push("Thiếu mã dịch vụ");
        else if (codeSet.size && !codeSet.has(serviceCode)) errors.push("Mã dịch vụ không tồn tại");
        if (!isValidDate(date)) errors.push("Ngày không hợp lệ");
        if (!Number.isFinite(finalPrice) || finalPrice <= 0) errors.push("Giá phải lớn hơn 0");

        const status = errors.length ? "error" : "valid";
        if (status === "valid") validRows++; else errorRows++;

        const item = { row: rowNum, serviceCode, packageId, date, type: typeLabel, finalPrice, basePrice: Number(r.basePrice || 0) || finalPrice, note, status, message: errors.length ? errors.join(", ") : "Hợp lệ" };
        results.push(item);

        if (commit && status === "valid") {
          await DailyPrice.findOneAndUpdate(
            { serviceCode, packageId, date },
            { $set: { serviceCode, packageId, date, type: typeLabel || "Ngày thường", finalPrice, basePrice: item.basePrice, note } },
            { upsert: true, setDefaultsOnInsert: true }
          );
        }
      }
    } else if (type === "services") {
      for (let i = 0; i < rawRows.length; i++) {
        const r = rawRows[i];
        const rowNum = i + 2;
        const name = String(r.name || r.ten || r["Tên dịch vụ"] || "").trim();
        const slug = String(r.slug || r.code || r.ma || "").trim();
        const category = String(r.category || r.danhMuc || "").trim();
        const price = Number(String(r.price ?? r.gia ?? 0).replace(/[^\d.-]/g, ""));
        const errors = [];
        if (!name) errors.push("Thiếu tên dịch vụ");
        if (!slug) errors.push("Thiếu slug/mã");
        if (!category) errors.push("Thiếu danh mục");
        if (!Number.isFinite(price) || price < 0) errors.push("Giá không hợp lệ");
        const status = errors.length ? "error" : "valid";
        if (status === "valid") validRows++; else errorRows++;
        results.push({ row: rowNum, name, slug, category, price, status, message: errors.length ? errors.join(", ") : "Hợp lệ" });
        if (commit && status === "valid") {
          await Service.findOneAndUpdate(
            { $or: [{ slug }, { code: slug }] },
            { $set: { name, slug, code: String(r.code || slug), category, price, locationName: String(r.locationName || r.diaDiem || ""), priceUnit: String(r.priceUnit || "khách"), status: String(r.status || "Hiển thị"), published: String(r.status || "Hiển thị") !== "Ẩn" } },
            { upsert: true, setDefaultsOnInsert: true }
          );
        }
      }
    } else {
      // generic preview
      rawRows.forEach((r, i) => results.push({ row: i + 2, ...r, status: "valid", message: "Hợp lệ" }));
      validRows = results.length;
    }

    res.json({
      success: true,
      data: {
        fileName: req.file.originalname,
        fileSize: `${Math.max(1, Math.round(req.file.size / 1024))} KB`,
        type,
        committed: commit,
        totalRows: rawRows.length,
        validRows,
        errorRows,
        rows: results.slice(0, 500),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Không thể xử lý file Excel.", error: error.message });
  }
};
