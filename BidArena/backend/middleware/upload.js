const multer = require("multer");

// Returns a multer instance — accepts folder name for compatibility with existing routes
const upload = (folder = "bidarena") => {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 1 * 1024 * 1024 }, // 1MB
  });
};

module.exports = upload;