const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  title:      { type: String, default: "" },
  subtitle:   { type: String, default: "" },
  image:      { type: String, required: true },
  link:       { type: String, default: "" },
  isActive:   { type: Boolean, default: true },
  order:      { type: Number, default: 0 },
  tournament: { type: mongoose.Schema.Types.ObjectId, ref: "Tournament" },
}, { timestamps: true });

module.exports = mongoose.model("Banner", bannerSchema);
