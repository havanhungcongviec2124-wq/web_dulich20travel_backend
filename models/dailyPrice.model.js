const mongoose = require("mongoose");

const dailyPriceSchema = new mongoose.Schema(
  {
    serviceCode: { type: String, required: true, trim: true, index: true },
    packageId: { type: String, default: "default", index: true },
    date: { type: String, required: true, index: true }, // ISO yyyy-mm-dd
    type: { type: String, default: "Ngày thường" },
    basePrice: { type: Number, default: 0 },
    finalPrice: { type: Number, default: 0 },
    adjust: { type: Number, default: 0 },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

dailyPriceSchema.index({ serviceCode: 1, packageId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("DailyPrice", dailyPriceSchema);
