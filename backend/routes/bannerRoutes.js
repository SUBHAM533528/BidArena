const express = require("express");
const ctrl = require("../controllers/bannerController");
const { protect, authorize } = require("../middleware/auth");
<<<<<<< HEAD
const bannerUpload = require("../middleware/bannerUpload");
=======
const upload = require("../middleware/upload");
>>>>>>> 617a044f6b0c35292d0a03bb03867426d01f5a7e
const router = express.Router();

router.get("/", ctrl.getBanners);
router.get("/:id", ctrl.getBanner);

<<<<<<< HEAD
router.post("/", protect, authorize("super_admin"), bannerUpload.single("image"), ctrl.createBanner);
router.put("/:id", protect, authorize("super_admin"), bannerUpload.single("image"), ctrl.updateBanner);
=======
router.post("/", protect, authorize("super_admin"), upload("banners").single("image"), ctrl.createBanner);
router.put("/:id", protect, authorize("super_admin"), upload("banners").single("image"), ctrl.updateBanner);
>>>>>>> 617a044f6b0c35292d0a03bb03867426d01f5a7e
router.delete("/:id", protect, authorize("super_admin"), ctrl.deleteBanner);
router.patch("/:id/toggle-active", protect, authorize("super_admin"), ctrl.toggleActive);
router.patch("/reorder", protect, authorize("super_admin"), ctrl.reorderBanners);

module.exports = router;
