const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");

// Get all rooms
router.get("/", roomController.getRooms);

// Get a specific room
router.get("/:id", roomController.getRoomById);

// Create a new room
router.post("/", roomController.addRoom);

// Update a room
router.put("/:id", roomController.updateRoom);

// Delete a room
router.delete("/:id", roomController.deleteRoom);

module.exports = router; 