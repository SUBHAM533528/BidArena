const express = require("express");
const ctrl = require("../controllers/reportController");
const ah = require("../middleware/asyncHandler");
const { protect, authorize } = require("../middleware/auth");
const router = express.Router();

router.get("/stats",              protect, ah(ctrl.getDashboardStats));
router.get("/bid-logs",           protect, ah(ctrl.getBidLogs));
router.get("/sold-players/csv",   protect, authorize("super_admin"), ah(ctrl.exportSoldPlayersCSV));

// PDF endpoints (admin only)
router.get("/pdf/all-players",    protect, authorize("super_admin"), ah(ctrl.pdfAllPlayers));
router.get("/pdf/sold-players",   protect, authorize("super_admin"), ah(ctrl.pdfSoldPlayers));
router.get("/pdf/unsold-players", protect, authorize("super_admin"), ah(ctrl.pdfUnsoldPlayers));
router.get("/pdf/team/:teamId",   protect, authorize("super_admin"), ah(ctrl.pdfTeamSquad));
router.get("/pdf/all-teams",      protect, authorize("super_admin"), ah(ctrl.pdfAllTeams));

module.exports = router;
