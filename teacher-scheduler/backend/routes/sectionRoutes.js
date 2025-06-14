const express = require("express");
const router = express.Router();
const sectionController = require("../controllers/sectionController");

// Get all sections
router.get("/", sectionController.getSections);

// Get section by ID
router.get("/:id", sectionController.getSectionById);

// Get sections by level
router.get("/level/:levelId", sectionController.getSectionsByLevel);

// Create new section
router.post("/", sectionController.addSection);

// Update section
router.put("/:id", sectionController.updateSection);

// Delete section
router.delete("/:id", sectionController.deleteSection);

module.exports = router; 