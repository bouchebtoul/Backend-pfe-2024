const mongoose = require("mongoose");

const YearSchema = new mongoose.Schema({
  year: { type: Number, required: true, unique: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
});

module.exports = mongoose.model("Year", YearSchema);
