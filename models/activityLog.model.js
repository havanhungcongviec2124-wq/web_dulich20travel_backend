const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    time: { type: String, default: "" },
    admin: { type: String, default: "" },
    adminId: { type: String, default: "" },
    action: { type: String, required: true },
    target: { type: String, default: "" },
    targetName: { type: String, default: "" },
    dateApplied: { type: String, default: "" },
    packageInfo: { type: String, default: "" },
    priceBefore: { type: String, default: "—" },
    priceAfter: { type: String, default: "—" },
    reason: { type: String, default: "" },
    timestamp: { type: String, default: "" },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
