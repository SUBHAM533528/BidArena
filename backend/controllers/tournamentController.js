const Tournament = require("../models/Tournament");

exports.createTournament = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.logo = `/uploads/tournaments/${req.file.filename}`;
    const tournament = await Tournament.create(data);
    res.status(201).json(tournament);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getTournaments = async (req, res) => {
  const tournaments = await Tournament.find().sort({ createdAt: -1 });
  res.json(tournaments);
};

exports.getTournament = async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);
  if (!tournament) return res.status(404).json({ message: "Tournament not found" });
  res.json(tournament);
};

exports.updateTournament = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.logo = `/uploads/tournaments/${req.file.filename}`;
    const tournament = await Tournament.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!tournament) return res.status(404).json({ message: "Tournament not found" });
    res.json(tournament);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteTournament = async (req, res) => {
  const tournament = await Tournament.findByIdAndDelete(req.params.id);
  if (!tournament) return res.status(404).json({ message: "Tournament not found" });
  res.json({ message: "Tournament deleted" });
};

exports.toggleActive = async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);
  if (!tournament) return res.status(404).json({ message: "Tournament not found" });
  tournament.isActive = !tournament.isActive;
  await tournament.save();
  res.json(tournament);
};

exports.toggleRegistration = async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);
  if (!tournament) return res.status(404).json({ message: "Tournament not found" });
  tournament.registrationOpen = !tournament.registrationOpen;
  await tournament.save();
  res.json(tournament);
};
