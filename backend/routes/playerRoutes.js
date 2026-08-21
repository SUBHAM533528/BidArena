const express = require("express");
const ctrl = require("../controllers/playerController");
const ah = require("../middleware/asyncHandler");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");
const router = express.Router();

const playerUpload = upload("players").fields([
  { name: "photo", maxCount: 1 },
  { name: "idProof", maxCount: 1 },
]);

router.post("/register", playerUpload, ah(ctrl.registerPlayer));
router.get("/", protect, ah(ctrl.getPlayers));
router.get("/:id", protect, ah(ctrl.getPlayer));
router.put("/:id", protect, authorize("super_admin"), playerUpload, ah(ctrl.updatePlayer));
router.delete("/", protect, authorize("super_admin"), ah(ctrl.deleteAllPlayers));
router.delete("/:id", protect, authorize("super_admin"), ah(ctrl.deletePlayer));
router.patch("/:id/status", protect, authorize("super_admin"), ah(ctrl.setStatus));
router.patch("/:id/auction-eligible", protect, authorize("super_admin"), ah(ctrl.setAuctionEligible));
router.patch("/:id/reset-auction-status", protect, authorize("super_admin"), ah(ctrl.resetAuctionStatus));

module.exports = router;
