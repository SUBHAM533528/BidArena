const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/galleryController");
const ah = require("../middleware/asyncHandler");
const { protect, authorize } = require("../middleware/auth");
const upload  = require("../middleware/upload");

// Public
router.get("/public", ah(ctrl.getGallery));

// Admin only
router.get(   "/",     protect, authorize("super_admin"), ah(ctrl.getAllGallery));
router.post(  "/",     protect, authorize("super_admin"), upload("gallery").single("image"), ah(ctrl.createGalleryItem));
router.put(   "/:id",  protect, authorize("super_admin"), upload("gallery").single("image"), ah(ctrl.updateGalleryItem));
router.delete("/:id",  protect, authorize("super_admin"), ah(ctrl.deleteGalleryItem));

module.exports = router;
