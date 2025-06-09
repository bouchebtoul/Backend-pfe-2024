const express = require("express");
const { 
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
} = require("../controllers/userController");
const { authMiddleware, adminMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

// All user routes require authentication and admin privileges
router.use(authMiddleware, adminMiddleware);

// Get all users
router.get("/", getUsers);

// Get user by ID
router.get("/:id", getUserById);

// Create new user
router.post("/", createUser);

// Update user
router.put("/:id", updateUser);

// Delete user
router.delete("/:id", deleteUser);

module.exports = router;
