const mongoose = require("mongoose");

const ScheduleSchema = new mongoose.Schema({
  teacherid: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
  moduleid: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
  levelid: { type: mongoose.Schema.Types.ObjectId, ref: "Level", required: true },
  semesterid: { type: mongoose.Schema.Types.ObjectId, ref: "Semester", required: true },
  yearid: { type: mongoose.Schema.Types.ObjectId, ref: "Year", required: true },
  hours: {
    lect: { type: Number, default: 0 },
    tut: { type: Number, default: 0 },
    wkshp: { type: Number, default: 0 },
  },
});

module.exports = mongoose.model("Schedule", ScheduleSchema);
