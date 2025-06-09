const express = require("express");
const { registerUser, loginUser, refreshToken, getCurrentUser } = require("../controllers/authController");
const { authMiddleware, adminMiddleware } = require("../middlewares/authMiddleware");
const { handleGoogleCallback } = require('../controllers/googleAuthController');

const router = express.Router();

// Only Admin can register new users
router.post("/register", authMiddleware, adminMiddleware, registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshToken);
router.get("/me", authMiddleware, getCurrentUser);

// Google authentication route
router.post('/google/callback', handleGoogleCallback);

module.exports = router;
