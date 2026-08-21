const express = require("express");
const AuctionState = require("../models/AuctionState");
const Player = require("../models/Player");
const Team = require("../models/Team");
const Tournament = require("../models/Tournament");
const ah = require("../middleware/asyncHandler");
const { protect } = require("../middleware/auth");
const router = express.Router();

// Get (or lazily create) the persisted auction state for a tournament.
// Used on page load / reconnect / server-restart recovery.
router.get("/state/:tournamentId", protect, ah(async (req, res) => {
  let state = await AuctionState.findOne({ tournament: req.params.tournamentId })
    .populate("currentPlayer")
    .populate("currentBidTeam", "name logo remainingPurse")
    .populate("lastSoldPlayer", "fullName")
    .populate("lastSoldTeam", "name logo");

  if (!state) {
    state = await AuctionState.create({ tournament: req.params.tournamentId });
  }
  res.json(state);
}));

// Auction pool: approved + eligible + not yet sold/unsold
router.get("/pool/:tournamentId", protect, ah(async (req, res) => {
  const tournament = await Tournament.findById(req.params.tournamentId, "defaultBasePrice");
  const pool = await Player.find({
    tournament: req.params.tournamentId,
    status: "Approved",
    auctionEligible: true,
    auctionStatus: { $in: ["Not Started"] },
  });

  // Self-heal players registered before basePrice existed on this model.
  const withBasePrice = pool.map((p) => {
    if (p.basePrice) return p;
    const obj = p.toObject();
    obj.basePrice = tournament?.defaultBasePrice || 0;
    return obj;
  });

  res.json(withBasePrice);
}));

// ── Multi-auction control-center overview ──────────────────────────────
// Every tournament runs its own isolated AuctionState + socket room
// (auction:<tournamentId>) and its own in-memory countdown timer keyed
// by tournamentId, so any number of tournaments can be auctioned live
// at the same time from different devices/venues without interfering
// with one another. This endpoint gives admins a single glance at every
// tournament's live status so they can jump straight into whichever
// auction room they need, instead of hunting through a dropdown.
router.get("/overview", protect, ah(async (req, res) => {
  const tournaments = await Tournament.find().sort({ createdAt: -1 });

  const overview = await Promise.all(
    tournaments.map(async (t) => {
      const [state, teamCount, poolCount, soldCount] = await Promise.all([
        AuctionState.findOne({ tournament: t._id })
          .populate("currentPlayer", "fullName")
          .populate("currentBidTeam", "name logo"),
        Team.countDocuments({ tournament: t._id }),
        Player.countDocuments({
          tournament: t._id,
          status: "Approved",
          auctionEligible: true,
          auctionStatus: "Not Started",
        }),
        Player.countDocuments({ tournament: t._id, auctionStatus: "Sold" }),
      ]);

      return {
        tournament: {
          _id: t._id,
          name: t.name,
          logo: t.logo,
          venue: t.venue,
          isActive: t.isActive,
        },
        status: state?.status || "idle",
        currentPlayer: state?.currentPlayer?.fullName || null,
        currentBidAmount: state?.currentBidAmount || 0,
        currentBidTeam: state?.currentBidTeam?.name || null,
        teamCount,
        poolCount,
        soldCount,
      };
    })
  );

  res.json(overview);
}));

module.exports = router;
