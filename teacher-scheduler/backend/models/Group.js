const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sectionid: { type: mongoose.Schema.Types.ObjectId, ref: "Section", required: true },
  capacity: { type: Number, required: true, min: 1 },
  description: { type: String }
});

// Ensure unique combination of name and section
GroupSchema.index({ name: 1, sectionid: 1 }, { unique: true });

module.exports = mongoose.model("Group", GroupSchema); 