const Banner = require("../models/Banner");

exports.createBanner = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.image = `/uploads/banners/${req.file.filename}`;
    if (!data.image) return res.status(400).json({ message: "Banner image is required" });
    const banner = await Banner.create(data);
    res.status(201).json(banner);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Public: only active banners, sorted for the carousel
exports.getBanners = async (req, res) => {
  const filter = {};
  if (req.query.all !== "true") filter.isActive = true;
  const banners = await Banner.find(filter).sort({ order: 1, createdAt: -1 });
  res.json(banners);
};

exports.getBanner = async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) return res.status(404).json({ message: "Banner not found" });
  res.json(banner);
};

exports.updateBanner = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.image = `/uploads/banners/${req.file.filename}`;
    const banner = await Banner.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!banner) return res.status(404).json({ message: "Banner not found" });
    res.json(banner);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteBanner = async (req, res) => {
  const banner = await Banner.findByIdAndDelete(req.params.id);
  if (!banner) return res.status(404).json({ message: "Banner not found" });
  res.json({ message: "Banner deleted" });
};

exports.toggleActive = async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) return res.status(404).json({ message: "Banner not found" });
  banner.isActive = !banner.isActive;
  await banner.save();
  res.json(banner);
};

exports.reorderBanners = async (req, res) => {
  try {
    const { order } = req.body; // array of { id, order }
    if (!Array.isArray(order)) return res.status(400).json({ message: "order must be an array" });
    await Promise.all(
      order.map(({ id, order: pos }) => Banner.findByIdAndUpdate(id, { order: pos }))
    );
    const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
    res.json(banners);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
