const mongoose = require("mongoose");

const ScheduleSchema = new mongoose.Schema({
  teacherid: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
  moduleid: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
  semesterid: { type: mongoose.Schema.Types.ObjectId, ref: "Semester", required: true },
  yearid: { type: mongoose.Schema.Types.ObjectId, ref: "Year", required: true },
  type: { type: String, required: true },
  day: { type: String, required: true },
  start: { type: String, required: true },
  end: { type: String, required: true },
  roomid: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
});

module.exports = mongoose.model("Schedule", ScheduleSchema);
