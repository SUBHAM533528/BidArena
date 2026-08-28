const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["player_registered", "contact_message"],
      default: "player_registered",
    },
    message: { type: String, required: true },
    tournament: { type: mongoose.Schema.Types.ObjectId, ref: "Tournament" },
    player: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
    contactMessage: { type: mongoose.Schema.Types.ObjectId, ref: "ContactMessage" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
