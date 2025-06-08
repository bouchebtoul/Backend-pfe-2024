const express = require("express");
const { 
    getRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole
} = require("../controllers/roleController");
const { authMiddleware, adminMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

// All role routes require authentication and admin privileges
router.use(authMiddleware, adminMiddleware);

// Get all roles
router.get("/", getRoles);

// Get role by ID
router.get("/:id", getRoleById);

// Create new role
router.post("/", createRole);

// Update role
router.put("/:id", updateRole);

// Delete role
router.delete("/:id", deleteRole);

module.exports = router;
