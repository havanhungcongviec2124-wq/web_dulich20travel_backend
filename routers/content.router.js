const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/content.controller");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", ctrl.get);
router.put("/", protect, adminOnly, ctrl.update);
router.put("/:key", protect, adminOnly, ctrl.update);

module.exports = router;
