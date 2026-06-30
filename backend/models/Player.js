const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema(
  {
    tournament: { type: mongoose.Schema.Types.ObjectId, ref: "Tournament", required: true },
    fullName: { type: String, required: true, trim: true },
    photo: { type: String, default: "" },
    mobile: { type: String, required: true },
    role: {
      type: String,
      enum: ["Batsman", "Bowler", "All-Rounder", "Wicket Keeper"],
      required: true,
    },
    battingStyle: { type: String, default: "" },
    bowlingStyle: { type: String, default: "" },
    idProof: { type: String, default: "" },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    auctionEligible: { type: Boolean, default: false },

    auctionStatus: {
      type: String,
      enum: ["Not Started", "In Auction", "Sold", "Unsold"],
      default: "Not Started",
    },
    soldTo: { type: mongoose.Schema.Types.ObjectId, ref: "Team", default: null },
    soldPrice: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Player", playerSchema);
