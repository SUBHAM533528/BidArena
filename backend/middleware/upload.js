const multer = require("multer");
const path = require("path");

const storage = (folder) =>
  multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, "..", "uploads", folder)),
    filename: (req, file, cb) => {
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, unique + path.extname(file.originalname));
    },
  });

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|pdf/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  if (ext) cb(null, true);
  else cb(new Error("Only images/PDF files are allowed"));
};

const upload = (folder) =>
  multer({
    storage: storage(folder),
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  });

module.exports = upload;
