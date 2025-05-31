const mongoose = require("mongoose");

const ModuleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  levelid: { type: mongoose.Schema.Types.ObjectId, ref: "Level", required: true },
  departmentid: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
  semesterid: { type: mongoose.Schema.Types.ObjectId, ref: "Semester", required: true },
});

module.exports = mongoose.model("Module", ModuleSchema);
