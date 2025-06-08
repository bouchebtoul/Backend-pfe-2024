const express = require("express");
const router = express.Router();
const levelController = require("../controllers/levelController");

// Get all levels
router.get("/", levelController.getLevels);

// Get level by ID
router.get("/:id", levelController.getLevelById);

// Get levels by speciality
router.get("/speciality/:specialityId", levelController.getLevelsBySpeciality);

// Add new level
router.post("/", levelController.addLevel);

// Update level
router.put("/:id", levelController.updateLevel);

// Delete level
router.delete("/:id", levelController.deleteLevel);

module.exports = router;
