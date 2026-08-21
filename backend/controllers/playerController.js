const Player = require("../models/Player");
const Tournament = require("../models/Tournament");
const Notification = require("../models/Notification");
const uploadToCloudinary = require("../utils/cloudinary");


exports.registerPlayer = async (req, res) => {
  try {
    let photoUrl  = "";

    if (req.files?.photo?.[0]) {
      photoUrl = await uploadToCloudinary(req.files.photo[0].buffer, "bidarena/photos");
    }

    // Base price isn't something a player sets for themselves — it comes
    // from whatever the admin configured as this tournament's default
    // player base price. Only fall back to it when the request didn't
    // already supply one.
    let basePrice = req.body.basePrice;
    if (!basePrice) {
      const tournament = await Tournament.findById(req.body.tournament);
      basePrice = tournament?.defaultBasePrice || 0;
    }

    const player = await Player.create({
      ...req.body,
      photo:   photoUrl,
      basePrice,

    });

    // Let the admin know a new player just registered — shows up as a
    // bell notification with the player's name, tournament, and timestamp.
    try {
      await Notification.create({
        type: "player_registered",
        message: `${player.fullName} registered for the auction`,
        tournament: player.tournament,
        player: player._id,
      });
    } catch (notifyErr) {
      console.error("Failed to create registration notification:", notifyErr.message);
    }

    res.status(201).json(player);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPlayers = async (req, res) => {
  const filter = {};
  if (req.query.tournament) filter.tournament = req.query.tournament;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.role) filter.role = req.query.role;
  if (req.query.auctionEligible)
    filter.auctionEligible = req.query.auctionEligible === "true";
  if (req.query.auctionStatus) filter.auctionStatus = req.query.auctionStatus;
  if (req.query.search) filter.fullName = new RegExp(req.query.search, "i");

  const players = await Player.find(filter)
    .populate("soldTo", "name logo")
    .populate("tournament", "defaultBasePrice")
    .sort({ createdAt: -1 });

  // Self-heal players registered before basePrice existed on this model —
  // fall back to their tournament's configured default at read time
  // instead of needing a one-off migration script.
  const withBasePrice = players.map((p) => {
    const obj = p.toObject();
    if (!obj.basePrice) obj.basePrice = obj.tournament?.defaultBasePrice || 0;
    obj.tournament = p.tournament?._id || p.tournament;
    return obj;
  });

  res.json(withBasePrice);
};

exports.getPlayer = async (req, res) => {
  const player = await Player.findById(req.params.id).populate("soldTo");
  if (!player) return res.status(404).json({ message: "Player not found" });
  res.json(player);
};

exports.updatePlayer = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files?.photo?.[0]) {
      data.photo = await uploadToCloudinary(req.files.photo[0].buffer, "bidarena/photos");
    }
  
    const player = await Player.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!player) return res.status(404).json({ message: "Player not found" });
    res.json(player);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deletePlayer = async (req, res) => {
  const player = await Player.findByIdAndDelete(req.params.id);
  if (!player) return res.status(404).json({ message: "Player not found" });
  res.json({ message: "Player deleted" });
};

// Bulk delete — requires ?tournament=<id> so a stray call can never wipe
// every player across every tournament by accident.
exports.deleteAllPlayers = async (req, res) => {
  const { tournament } = req.query;
  if (!tournament) return res.status(400).json({ message: "tournament query param is required" });
  const result = await Player.deleteMany({ tournament });
  res.json({ message: `${result.deletedCount} player(s) deleted` });
};

exports.setStatus = async (req, res) => {
  const { status } = req.body; // Approved | Rejected | Pending
  const player = await Player.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true },
  );
  if (!player) return res.status(404).json({ message: "Player not found" });
  res.json(player);
};

exports.setAuctionEligible = async (req, res) => {
  const { eligible } = req.body; // boolean
  const player = await Player.findByIdAndUpdate(
    req.params.id,
    { auctionEligible: !!eligible },
    { new: true },
  );
  if (!player) return res.status(404).json({ message: "Player not found" });
  res.json(player);
};

// Reset an unsold player back into "Not Started" so it re-enters the auction pool
exports.resetAuctionStatus = async (req, res) => {
  const player = await Player.findByIdAndUpdate(
    req.params.id,
    { auctionStatus: "Not Started", soldTo: null, soldPrice: 0 },
    { new: true },
  );
  if (!player) return res.status(404).json({ message: "Player not found" });
  res.json(player);
};
