const SiteContent = require("../models/SiteContent");

// Public — fetch a content block by key, e.g. GET /api/content/terms
exports.getContent = async (req, res) => {
  try {
    const doc = await SiteContent.findOne({ key: req.params.key });
    res.json(doc || { key: req.params.key, title: "", content: "" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Admin — create or update a content block
exports.upsertContent = async (req, res) => {
  try {
    const { title = "", content = "" } = req.body;
    const doc = await SiteContent.findOneAndUpdate(
      { key: req.params.key },
      { key: req.params.key, title, content },
      { new: true, upsert: true }
    );
    res.json(doc);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
