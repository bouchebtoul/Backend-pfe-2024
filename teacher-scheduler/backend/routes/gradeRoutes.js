const express = require("express");
const router = express.Router();
const gradeController = require("../controllers/gradeController");

router.post("/", gradeController.addGrade);
router.get("/", gradeController.getGrades);
router.put("/:id", gradeController.updateGrade);
router.delete("/:id", gradeController.deleteGrade);

module.exports = router;
