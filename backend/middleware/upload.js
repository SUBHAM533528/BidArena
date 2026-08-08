const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const cloudinaryStorage = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new cloudinaryStorage.CloudinaryStorage({
  cloudinary,
  params: {
    folder:          "bidarena",
    allowed_formats: ["jpg", "jpeg", "png", "pdf"],
    resource_type:   "auto",
  },
});

const upload = multer({ storage });

module.exports = upload;