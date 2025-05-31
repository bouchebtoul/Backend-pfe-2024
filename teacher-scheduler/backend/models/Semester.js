const mongoose = require("mongoose");

const SemesterSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
});

module.exports = mongoose.model("Semester", SemesterSchema);
