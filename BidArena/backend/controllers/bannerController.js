const Banner = require("../models/Banner");
const uploadToCloudinary = require("../utils/cloudinary");

// Public — get all active banners
exports.getBanners = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.tournament) filter.tournament = req.query.tournament;
    const banners = await Banner.find(filter).sort({ order: 1, createdAt: 1 });
    res.json(banners);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Admin — get all banners (including inactive)
exports.getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
    res.json(banners);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Admin — create banner
exports.createBanner = async (req, res) => {
  try {
    let imageUrl = "";
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer, "bidarena/banners");
    } else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl;
    } else {
      return res.status(400).json({ message: "Banner image is required" });
    }
    const banner = await Banner.create({
      title:      req.body.title    || "",
      subtitle:   req.body.subtitle || "",
      image:      imageUrl,
      link:       req.body.link     || "",
      isActive:   req.body.isActive !== "false",
      order:      Number(req.body.order) || 0,
      tournament: req.body.tournament || undefined,
    });
    res.status(201).json(banner);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Admin — update banner
exports.updateBanner = async (req, res) => {
  try {
    const data = {
      title:    req.body.title    ?? undefined,
      subtitle: req.body.subtitle ?? undefined,
      link:     req.body.link     ?? undefined,
      isActive: req.body.isActive !== undefined ? req.body.isActive !== "false" : undefined,
      order:    req.body.order !== undefined ? Number(req.body.order) : undefined,
    };
    if (req.file) {
      data.image = await uploadToCloudinary(req.file.buffer, "bidarena/banners");
    }
    Object.keys(data).forEach(k => data[k] === undefined && delete data[k]);
    const banner = await Banner.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!banner) return res.status(404).json({ message: "Banner not found" });
    res.json(banner);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Admin — delete banner
exports.deleteBanner = async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ message: "Banner deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
