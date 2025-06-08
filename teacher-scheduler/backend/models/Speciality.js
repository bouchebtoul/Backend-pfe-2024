const mongoose = require("mongoose");

const SpecialitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  description: { type: String },
  departmentid: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true }
});

module.exports = mongoose.model("Speciality", SpecialitySchema); 