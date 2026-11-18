const express = require("express");
const router = express.Router();
const { login, me, changePassword, forgotPassword } = require("../controllers/user.controller");
const { protect } = require("../middleware/authMiddleware");

router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.get("/me", protect, me);
router.post("/change-password", protect, changePassword);

module.exports = router;
