const mongoose = require("mongoose");

// One live document per tournament holding the current auction state,
// so the room can be reconstructed if the server restarts.
const auctionStateSchema = new mongoose.Schema(
  {
    tournament: { type: mongoose.Schema.Types.ObjectId, ref: "Tournament", required: true, unique: true },
    status: {
      type: String,
      enum: ["idle", "running", "paused", "ended"],
      default: "idle",
    },
    currentPlayer: { type: mongoose.Schema.Types.ObjectId, ref: "Player", default: null },
    currentBidAmount: { type: Number, default: 0 },
    currentBidTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team", default: null },
    timerEndsAt: { type: Date, default: null },
    lastSoldPlayer: { type: mongoose.Schema.Types.ObjectId, ref: "Player", default: null },
    lastSoldTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team", default: null },
    lastSoldPrice: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuctionState", auctionStateSchema);
