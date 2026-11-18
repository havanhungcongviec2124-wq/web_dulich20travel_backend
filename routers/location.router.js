const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/location.controller");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", ctrl.list);
router.post("/", protect, adminOnly, ctrl.create);
router.put("/:id", protect, adminOnly, ctrl.update);
router.delete("/:id", protect, adminOnly, ctrl.remove);

module.exports = router;
