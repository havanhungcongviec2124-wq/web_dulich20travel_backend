const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true }, // hotel, cruise-day...
    name: { type: String, required: true, trim: true },
    slug: { type: String, default: "" },
    desc: { type: String, default: "" },
    unit: { type: String, default: "dịch vụ" },
    icon: { type: String, default: "" },
    image: { type: String, default: "" },
    count: { type: Number, default: 0 },
    status: { type: String, enum: ["Bật", "Ẩn"], default: "Bật" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
