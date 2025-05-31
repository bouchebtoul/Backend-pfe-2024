const express = require("express");
const router = express.Router();
const semesterController = require("../controllers/semesterController");

router.post("/", semesterController.addSemester);
router.get("/", semesterController.getSemesters);
router.put("/:id", semesterController.updateSemester);
router.delete("/:id", semesterController.deleteSemester);

module.exports = router;
