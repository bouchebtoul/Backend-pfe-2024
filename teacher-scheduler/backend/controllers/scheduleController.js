const Schedule = require("../models/Schedule");

exports.addSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.create(req.body);
    res.status(201).json(schedule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getSchedules = async (req, res) => {
  try {
    const { academicyearid } = req.query;
    let query = {};
    if (academicyearid) {
      query.yearid = academicyearid;
    }
    const schedules = await Schedule.find(query)
      .populate("teacherid moduleid yearid roomid sectionid groupid");
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getScheduleById = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate("teacherid moduleid yearid roomid sectionid groupid");
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(schedule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    await Schedule.findByIdAndDelete(req.params.id);
    res.json({ message: "Schedule deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

