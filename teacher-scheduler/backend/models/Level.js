const mongoose = require("mongoose");

const LevelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  specialityid: { type: mongoose.Schema.Types.ObjectId, ref: "Speciality", required: true },
  color: { 
    type: String, 
    required: true,
    default: "#e3f2fd" // Default light blue color
  }
});

module.exports = mongoose.model("Level", LevelSchema);
