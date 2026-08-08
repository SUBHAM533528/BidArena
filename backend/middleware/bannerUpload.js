const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Banner-specific upload middleware.
// Unlike the shared middleware (../middleware/upload.js) which uses
// memoryStorage without ever persisting the buffer or setting req.file.filename,
// this one writes the file to disk under /uploads/banners and sets
// req.file.filename correctly, matching what bannerController expects.

const bannersDir = path.join(__dirname, "..", "uploads", "banners");
fs.mkdirSync(bannersDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, bannersDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const bannerUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

module.exports = bannerUpload;
