const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema(
  {
    tournament: { type: mongoose.Schema.Types.ObjectId, ref: "Tournament", required: true },
    fullName: { type: String, required: true, trim: true },
    photo: { type: String, default: "" },
    mobile: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    dob: { type: Date, required: true },
    role: {
      type: String,
      enum: ["Batsman", "Bowler", "All-Rounder", "Wicket Keeper"],
      required: true,
    },
    battingStyle: { type: String, default: "" },
    bowlingStyle: { type: String, default: "" },
    district: { type: String, required: true },
    state: { type: String, required: true },
    experience: { type: Number, default: 0 },
    previousTeams: { type: String, default: "" },
    matchesPlayed: { type: Number, default: 0 },
    runs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    basePrice: { type: Number, required: true, default: 100000 },
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
