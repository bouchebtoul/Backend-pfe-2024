const Year = require("../models/Year");

exports.addYear = async (req, res) => {
  try {
    const year = await Year.create(req.body);
    res.status(201).json(year);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getYears = async (req, res) => {
  try {
    const years = await Year.find();
    res.json(years);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateYear = async (req, res) => {
  try {
    const year = await Year.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(year);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteYear = async (req, res) => {
  try {
    await Year.findByIdAndDelete(req.params.id);
    res.json({ message: "Year deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
