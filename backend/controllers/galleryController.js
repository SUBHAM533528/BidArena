const GalleryItem = require("../models/GalleryItem");
const uploadToCloudinary = require("../utils/cloudinary");

// Public — active gallery items only
exports.getGallery = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.tournament) filter.tournament = req.query.tournament;
    const items = await GalleryItem.find(filter).sort({ order: 1, createdAt: -1 });
    res.json(items);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Admin — all gallery items
exports.getAllGallery = async (req, res) => {
  try {
    const items = await GalleryItem.find().sort({ order: 1, createdAt: -1 });
    res.json(items);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Admin — create
exports.createGalleryItem = async (req, res) => {
  try {
    let imageUrl = "";
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer, "bidarena/gallery");
    } else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl;
    } else {
      return res.status(400).json({ message: "An image is required" });
    }
    const item = await GalleryItem.create({
      image:      imageUrl,
      caption:    req.body.caption  || "",
      location:   req.body.location || "",
      tournament: req.body.tournament || undefined,
      order:      Number(req.body.order) || 0,
      isActive:   req.body.isActive !== "false",
    });
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Admin — update
exports.updateGalleryItem = async (req, res) => {
  try {
    const data = {
      caption:  req.body.caption  ?? undefined,
      location: req.body.location ?? undefined,
      order:    req.body.order !== undefined ? Number(req.body.order) : undefined,
      isActive: req.body.isActive !== undefined ? req.body.isActive !== "false" : undefined,
    };
    if (req.file) {
      data.image = await uploadToCloudinary(req.file.buffer, "bidarena/gallery");
    }
    Object.keys(data).forEach(k => data[k] === undefined && delete data[k]);
    const item = await GalleryItem.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!item) return res.status(404).json({ message: "Gallery item not found" });
    res.json(item);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Admin — delete
exports.deleteGalleryItem = async (req, res) => {
  try {
    await GalleryItem.findByIdAndDelete(req.params.id);
    res.json({ message: "Gallery item deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
