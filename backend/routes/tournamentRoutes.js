const express = require("express");
const ctrl = require("../controllers/tournamentController");
const ah = require("../middleware/asyncHandler");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");
const router = express.Router();

router.get("/", ah(ctrl.getTournaments));
router.get("/:id", ah(ctrl.getTournament));

router.post("/", protect, authorize("super_admin"), upload("tournaments").single("logo"), ah(ctrl.createTournament));
router.put("/:id", protect, authorize("super_admin"), upload("tournaments").single("logo"), ah(ctrl.updateTournament));
router.delete("/", protect, authorize("super_admin"), ah(ctrl.deleteAllTournaments));
router.delete("/:id", protect, authorize("super_admin"), ah(ctrl.deleteTournament));
router.patch("/:id/toggle-active", protect, authorize("super_admin"), ah(ctrl.toggleActive));
router.patch("/:id/toggle-registration", protect, authorize("super_admin"), ah(ctrl.toggleRegistration));

module.exports = router;
