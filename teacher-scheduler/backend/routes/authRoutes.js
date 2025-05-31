const express = require("express");
const { registerUser, loginUser, refreshToken } = require("../controllers/authController");
const { authMiddleware, adminMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

// Only Admin can register new users
router.post("/register", authMiddleware, adminMiddleware, registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshToken);

module.exports = router;
