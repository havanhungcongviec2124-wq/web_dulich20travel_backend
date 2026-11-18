const mongoose = require("mongoose");

const consultantSchema = new mongoose.Schema(
  {
    key: { type: String, trim: true }, // e.g. minh-anh
    name: { type: String, required: true, trim: true },
    role: { type: String, default: "" },
    specialty: { type: String, default: "" },
    phone: { type: String, default: "" },
    zalo: { type: String, default: "" },
    facebook: { type: String, default: "" },
    status: { type: String, default: "Hoạt động" },
    active: { type: Boolean, default: true },
    avatar: { type: String, default: "" },
    tagline: { type: String, default: "" },
    image: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Consultant", consultantSchema);
