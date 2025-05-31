const mongoose = require("mongoose");

const GradeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
});

module.exports = mongoose.model("Grade", GradeSchema);
