const mongoose = require("mongoose");

const LevelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  specialityid: { type: mongoose.Schema.Types.ObjectId, ref: "Speciality", required: true }
});

module.exports = mongoose.model("Level", LevelSchema);
