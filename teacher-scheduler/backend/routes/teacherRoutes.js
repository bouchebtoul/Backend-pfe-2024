const express = require("express");
const router = express.Router();
const teacherController = require("../controllers/teacherController");

router.get("/", teacherController.getTeachers); // ❌ This might be undefined
router.get("/:id", teacherController.getTeacherById);
router.post("/", teacherController.addTeacher);
router.put("/:id", teacherController.updateTeacher);
router.delete("/:id", teacherController.deleteTeacher);

module.exports = router;
