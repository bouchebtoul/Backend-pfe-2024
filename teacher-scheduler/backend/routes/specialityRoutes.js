const express = require("express");
const router = express.Router();
const specialityController = require("../controllers/specialityController");

// Get all specialities
router.get("/", specialityController.getSpecialities);

// Get speciality by ID
router.get("/:id", specialityController.getSpecialityById);

// Get specialities by department
router.get("/department/:departmentid", specialityController.getSpecialitiesByDepartment);

// Add new speciality
router.post("/", specialityController.addSpeciality);

// Update speciality
router.put("/:id", specialityController.updateSpeciality);

// Delete speciality
router.delete("/:id", specialityController.deleteSpeciality);

module.exports = router; 