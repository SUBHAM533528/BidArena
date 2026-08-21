const express = require("express");
const ctrl = require("../controllers/teamController");
const ah = require("../middleware/asyncHandler");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");
const router = express.Router();

router.get("/", ah(ctrl.getTeams));
router.get("/:id", ah(ctrl.getTeam));

router.post("/", protect, authorize("super_admin"), upload("teams").single("logo"), ah(ctrl.createTeam));
router.put("/:id", protect, authorize("super_admin"), upload("teams").single("logo"), ah(ctrl.updateTeam));
router.delete("/", protect, authorize("super_admin"), ah(ctrl.deleteAllTeams));
router.delete("/:id", protect, authorize("super_admin"), ah(ctrl.deleteTeam));

module.exports = router;
