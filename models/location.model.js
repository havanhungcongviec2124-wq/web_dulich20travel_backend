const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    region: { type: String, default: "" },
    image: { type: String, default: "" },
    type: { type: String, enum: ["destination", "location"], default: "location" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Location", locationSchema);
