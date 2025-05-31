const express = require("express");
const { createRole } = require("../controllers/roleController");

const { authMiddleware, adminMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

// ✅ Route to create a new role (Only Admin can create roles)
router.post("/roles", authMiddleware, adminMiddleware,createRole);

module.exports = router;
