const Team = require("../models/Team");

exports.createTeam = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.logo = `/uploads/teams/${req.file.filename}`;
    data.remainingPurse = data.initialPurse;
    const team = await Team.create(data);
    res.status(201).json(team);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getTeams = async (req, res) => {
  const filter = {};
  if (req.query.tournament) filter.tournament = req.query.tournament;
  const teams = await Team.find(filter)
    .populate("squad.player", "fullName role photo")
    .sort({ createdAt: -1 });
  res.json(teams);
};

exports.getTeam = async (req, res) => {
  const team = await Team.findById(req.params.id).populate("squad.player");
  if (!team) return res.status(404).json({ message: "Team not found" });
  res.json(team);
};

exports.updateTeam = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.logo = `/uploads/teams/${req.file.filename}`;
    const team = await Team.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!team) return res.status(404).json({ message: "Team not found" });
    res.json(team);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteTeam = async (req, res) => {
  const team = await Team.findByIdAndDelete(req.params.id);
  if (!team) return res.status(404).json({ message: "Team not found" });
  res.json({ message: "Team deleted" });
};
