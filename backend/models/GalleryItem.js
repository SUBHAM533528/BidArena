const mongoose = require("mongoose");

const galleryItemSchema = new mongoose.Schema({
  image:      { type: String, required: true },
  caption:    { type: String, default: "" },
  location:   { type: String, default: "" }, // where the auction/event was held
  tournament: { type: mongoose.Schema.Types.ObjectId, ref: "Tournament" },
  order:      { type: Number, default: 0 },
  isActive:   { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("GalleryItem", galleryItemSchema);
