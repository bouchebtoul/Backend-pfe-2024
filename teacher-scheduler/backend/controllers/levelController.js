const Level = require("../models/Level");

exports.addLevel = async (req, res) => {
  try {
    const level = await Level.create(req.body);
    res.status(201).json(level);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getLevels = async (req, res) => {
  try {
    const levels = await Level.find();
    res.json(levels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateLevel = async (req, res) => {
  try {
    const level = await Level.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(level);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteLevel = async (req, res) => {
  try {
    await Level.findByIdAndDelete(req.params.id);
    res.json({ message: "Level deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
