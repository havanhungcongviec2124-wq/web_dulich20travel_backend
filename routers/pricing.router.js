const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/pricing.controller");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Public read for calendar/price lookup
router.get("/rules", ctrl.listRules);
router.get("/daily", ctrl.listDaily);
router.get("/calendar", ctrl.calendar);

// Admin mutations
router.post("/rules", protect, adminOnly, ctrl.upsertRule);
router.put("/rules/:id", protect, adminOnly, ctrl.updateRule);
router.delete("/rules/:id", protect, adminOnly, ctrl.removeRule);

router.post("/daily", protect, adminOnly, ctrl.upsertDaily);
router.put("/daily/:id", protect, adminOnly, ctrl.updateDaily);
router.delete("/daily/:id", protect, adminOnly, ctrl.removeDaily);

module.exports = router;
