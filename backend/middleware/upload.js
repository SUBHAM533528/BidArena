const multer = require("multer");

// Returns a multer instance — accepts folder name for compatibility with existing routes.
// 1MB was too tight for real photos (phone camera shots routinely run 3-6MB),
// which is what was causing "MulterError: File too large" on gallery/banner/
// tournament image uploads. Cloudinary handles the actual optimization on
// the way out, so the incoming cap just needs to be generous enough to not
// reject normal photos.
const upload = (folder = "bidarena") => {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  });
};

module.exports = upload;