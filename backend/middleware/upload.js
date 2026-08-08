const multer = require("multer");

// Use memory storage — files held in buffer, uploaded to Cloudinary in controller
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

module.exports = upload;