const express = require("express");
const router = express.Router();
const semesterController = require("../controllers/semesterController");
const { getCurrentSemester } = require('../controllers/semesterController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.post("/", semesterController.addSemester);
router.get("/", semesterController.getSemesters);
router.put("/:id", semesterController.updateSemester);
router.delete("/:id", semesterController.deleteSemester);

// Get current semester
router.get('/current', authMiddleware, getCurrentSemester);

module.exports = router;
