const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/scheduleController");

router.post("/", scheduleController.addSchedule);
router.get("/", scheduleController.getSchedules);
router.get("/:id", scheduleController.getScheduleById);
router.put("/:id", scheduleController.updateSchedule);
router.delete("/:id", scheduleController.deleteSchedule);

module.exports = router;
