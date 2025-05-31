const mongoose = require("mongoose");

const LevelSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  groupes: { type: Number, required: true },
  sections: { type: Number, required: true },
});

module.exports = mongoose.model("Level", LevelSchema);
