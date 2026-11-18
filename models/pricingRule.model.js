const mongoose = require("mongoose");

const pricingRuleSchema = new mongoose.Schema(
  {
    serviceCode: { type: String, required: true, trim: true, index: true },
    serviceName: { type: String, default: "" },
    packageId: { type: String, default: "default", index: true },
    packageName: { type: String, default: "" },
    weekday: { type: mongoose.Schema.Types.Mixed, default: {} },
    weekend: { type: mongoose.Schema.Types.Mixed, default: {} },
    lowSeason: { type: mongoose.Schema.Types.Mixed, default: {} },
    holiday: { type: mongoose.Schema.Types.Mixed, default: {} },
    priorityNote: { type: String, default: "" },
  },
  { timestamps: true }
);

pricingRuleSchema.index({ serviceCode: 1, packageId: 1 }, { unique: true });

module.exports = mongoose.model("PricingRule", pricingRuleSchema);
