const mongoose = require("mongoose");

const SectionSchema = new mongoose.Schema({
  number: { type: String, required: true },
  levelid: { type: mongoose.Schema.Types.ObjectId, ref: "Level", required: true },
  capacity: { type: Number, required: true, min: 1 },
  description: { type: String }
});

// Ensure unique combination of number and level
SectionSchema.index({ number: 1, levelid: 1 }, { unique: true });

module.exports = mongoose.model("Section", SectionSchema); 