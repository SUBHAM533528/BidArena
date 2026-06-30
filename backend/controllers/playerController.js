const Player = require("../models/Player");

exports.registerPlayer = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files?.photo) data.photo = `/uploads/players/${req.files.photo[0].filename}`;
    if (req.files?.idProof) data.idProof = `/uploads/players/${req.files.idProof[0].filename}`;
    const player = await Player.create(data);
    res.status(201).json(player);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getPlayers = async (req, res) => {
  const filter = {};
  if (req.query.tournament) filter.tournament = req.query.tournament;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.role) filter.role = req.query.role;
  if (req.query.district) filter.district = new RegExp(req.query.district, "i");
  if (req.query.state) filter.state = new RegExp(req.query.state, "i");
  if (req.query.auctionEligible) filter.auctionEligible = req.query.auctionEligible === "true";
  if (req.query.auctionStatus) filter.auctionStatus = req.query.auctionStatus;
  if (req.query.search) filter.fullName = new RegExp(req.query.search, "i");

  const players = await Player.find(filter)
    .populate("soldTo", "name logo")
    .sort({ createdAt: -1 });
  res.json(players);
};

exports.getPlayer = async (req, res) => {
  const player = await Player.findById(req.params.id).populate("soldTo");
  if (!player) return res.status(404).json({ message: "Player not found" });
  res.json(player);
};

exports.updatePlayer = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files?.photo) data.photo = `/uploads/players/${req.files.photo[0].filename}`;
    if (req.files?.idProof) data.idProof = `/uploads/players/${req.files.idProof[0].filename}`;
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

exports.setStatus = async (req, res) => {
  const { status } = req.body; // Approved | Rejected | Pending
  const player = await Player.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!player) return res.status(404).json({ message: "Player not found" });
  res.json(player);
};

exports.setAuctionEligible = async (req, res) => {
  const { eligible } = req.body; // boolean
  const player = await Player.findByIdAndUpdate(
    req.params.id,
    { auctionEligible: !!eligible },
    { new: true }
  );
  if (!player) return res.status(404).json({ message: "Player not found" });
  res.json(player);
};

// Reset an unsold player back into "Not Started" so it re-enters the auction pool
exports.resetAuctionStatus = async (req, res) => {
  const player = await Player.findByIdAndUpdate(
    req.params.id,
    { auctionStatus: "Not Started", soldTo: null, soldPrice: 0 },
    { new: true }
  );
  if (!player) return res.status(404).json({ message: "Player not found" });
  res.json(player);
};
