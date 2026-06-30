const mongoose = require("mongoose");

const tournamentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    logo: { type: String, default: "" },
    description: { type: String, default: "" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    venue: { type: String, required: true },
    registrationStartDate: { type: Date, required: true },
    registrationEndDate: { type: Date, required: true },
    maxTeams: { type: Number, required: true, default: 8 },
    maxPlayers: { type: Number, required: true, default: 200 },
    isActive: { type: Boolean, default: false },
    registrationOpen: { type: Boolean, default: false },
    bidIncrements: {
      type: [Number],
      default: [500, 1000, 2000, 5000, 10000],
    },
    auctionTimerSeconds: { type: Number, default: 60 },
    auctionMode: { type: String, enum: ["random", "serial"], default: "random" },
    defaultBasePrice: { type: Number, default: 100000 },
    defaultTeamPurse: { type: Number, default: 10000000 },
    closedMessage: {
      type: String,
      default: "Player Registration is Currently Closed",
    },
    contactDetails: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tournament", tournamentSchema);
