const mongoose = require("mongoose");

const bidSchema = new mongoose.Schema(
  {
    tournament: { type: mongoose.Schema.Types.ObjectId, ref: "Tournament", required: true },
    player: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    amount: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bid", bidSchema);
