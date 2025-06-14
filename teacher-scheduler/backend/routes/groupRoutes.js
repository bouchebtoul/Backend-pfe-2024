const express = require("express");
const router = express.Router();
const groupController = require("../controllers/groupController");

// Get all groups
router.get("/", groupController.getGroups);

// Get group by ID
router.get("/:id", groupController.getGroupById);

// Get groups by section
router.get("/section/:sectionId", groupController.getGroupsBySection);

// Create new group
router.post("/", groupController.addGroup);

// Update group
router.put("/:id", groupController.updateGroup);

// Delete group
router.delete("/:id", groupController.deleteGroup);

module.exports = router; 