const mongoose = require("mongoose");

const siteContentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true }, // e.g. main
    company: { type: mongoose.Schema.Types.Mixed, default: {} },
    banners: { type: [mongoose.Schema.Types.Mixed], default: [] },
    policies: { type: [mongoose.Schema.Types.Mixed], default: [] },
    info: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SiteContent", siteContentSchema);
