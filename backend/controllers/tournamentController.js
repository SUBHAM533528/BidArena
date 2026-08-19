const Tournament = require("../models/Tournament");
const Player = require("../models/Player");
const uploadToCloudinary = require("../utils/cloudinary");

// Registration has its own end date/time — once it passes, registration
// should read as closed everywhere (admin panel, landing page, the
// registration form itself) even if nobody manually flips the toggle.
// This lazily "heals" any tournament whose window has lapsed, right
// where it's read, so no cron job is needed.
async function autoCloseExpiredRegistration(tournament) {
  if (
    tournament.registrationOpen &&
    tournament.registrationEndDate &&
    Date.now() > new Date(tournament.registrationEndDate).getTime()
  ) {
    tournament.registrationOpen = false;
    await tournament.save();
  }
  return tournament;
}

exports.createTournament = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.logo = await uploadToCloudinary(req.file.buffer, "bidarena/tournaments");
    const tournament = await Tournament.create(data);
    res.status(201).json(tournament);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getTournaments = async (req, res) => {
  const tournaments = await Tournament.find().sort({ createdAt: -1 });
  await Promise.all(tournaments.map(autoCloseExpiredRegistration));

  // Attach a public registered-player count so the landing page can show
  // "X players registered" per tournament without needing admin auth.
  const withCounts = await Promise.all(
    tournaments.map(async (t) => {
      const registeredPlayers = await Player.countDocuments({ tournament: t._id });
      return { ...t.toObject(), registeredPlayers };
    })
  );
  res.json(withCounts);
};

exports.getTournament = async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);
  if (!tournament)
    return res.status(404).json({ message: "Tournament not found" });
  await autoCloseExpiredRegistration(tournament);
  const registeredPlayers = await Player.countDocuments({ tournament: tournament._id });
  res.json({ ...tournament.toObject(), registeredPlayers });
};

exports.updateTournament = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.logo = await uploadToCloudinary(req.file.buffer, "bidarena/tournaments");
    const tournament = await Tournament.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!tournament)
      return res.status(404).json({ message: "Tournament not found" });
    res.json(tournament);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteTournament = async (req, res) => {
  const tournament = await Tournament.findByIdAndDelete(req.params.id);
  if (!tournament)
    return res.status(404).json({ message: "Tournament not found" });
  res.json({ message: "Tournament deleted" });
};

exports.toggleActive = async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);
  if (!tournament)
    return res.status(404).json({ message: "Tournament not found" });
  tournament.isActive = !tournament.isActive;
  await tournament.save();
  res.json(tournament);
};

exports.toggleRegistration = async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);
  if (!tournament)
    return res.status(404).json({ message: "Tournament not found" });
  tournament.registrationOpen = !tournament.registrationOpen;
  await tournament.save();
  res.json(tournament);
};
