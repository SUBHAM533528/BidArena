const express = require("express");
const AuctionState = require("../models/AuctionState");
const Player = require("../models/Player");
const { protect } = require("../middleware/auth");
const router = express.Router();

// Get (or lazily create) the persisted auction state for a tournament.
// Used on page load / reconnect / server-restart recovery.
router.get("/state/:tournamentId", protect, async (req, res) => {
  let state = await AuctionState.findOne({ tournament: req.params.tournamentId })
    .populate("currentPlayer")
    .populate("currentBidTeam", "name logo remainingPurse")
    .populate("lastSoldPlayer", "fullName")
    .populate("lastSoldTeam", "name logo");

  if (!state) {
    state = await AuctionState.create({ tournament: req.params.tournamentId });
  }
  res.json(state);
});

// Auction pool: approved + eligible + not yet sold/unsold
router.get("/pool/:tournamentId", protect, async (req, res) => {
  const pool = await Player.find({
    tournament: req.params.tournamentId,
    status: "Approved",
    auctionEligible: true,
    auctionStatus: { $in: ["Not Started"] },
  });
  res.json(pool);
});

module.exports = router;
