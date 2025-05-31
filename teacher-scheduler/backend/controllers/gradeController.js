const Grade = require("../models/Grade");

exports.addGrade = async (req, res) => {
  try {
    const grade = await Grade.create(req.body);
    res.status(201).json(grade);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getGrades = async (req, res) => {
  try {
    const grades = await Grade.find();
    res.json(grades);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateGrade = async (req, res) => {
  try {
    const grade = await Grade.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(grade);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteGrade = async (req, res) => {
  try {
    await Grade.findByIdAndDelete(req.params.id);
    res.json({ message: "Grade deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
