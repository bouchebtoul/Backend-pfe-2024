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
    const levels = await Level.find()
      .populate("specialityid")
      .populate({
        path: "specialityid",
        populate: {
          path: "departmentid"
        }
      });
    res.json(levels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getLevelById = async (req, res) => {
  try {
    const level = await Level.findById(req.params.id)
      .populate("specialityid")
      .populate({
        path: "specialityid",
        populate: {
          path: "departmentid"
        }
      });
    if (!level) {
      return res.status(404).json({ message: "Level not found" });
    }
    res.json(level);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateLevel = async (req, res) => {
  try {
    const level = await Level.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate("specialityid");
    
    if (!level) {
      return res.status(404).json({ message: "Level not found" });
    }
    res.json(level);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteLevel = async (req, res) => {
  try {
    const level = await Level.findByIdAndDelete(req.params.id);
    if (!level) {
      return res.status(404).json({ message: "Level not found" });
    }
    res.json({ message: "Level deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get levels by speciality
exports.getLevelsBySpeciality = async (req, res) => {
  try {
    const levels = await Level.find({ 
      specialityid: req.params.specialityId 
    })
    .populate("specialityid")
    .populate({
      path: "specialityid",
      populate: {
        path: "departmentid"
      }
    });
    res.json(levels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
