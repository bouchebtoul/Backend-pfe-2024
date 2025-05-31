const Semester = require("../models/Semester");

exports.addSemester = async (req, res) => {
  try {
    const semester = await Semester.create(req.body);
    res.status(201).json(semester);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getSemesters = async (req, res) => {
  try {
    const semesters = await Semester.find();
    res.json(semesters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSemester = async (req, res) => {
  try {
    const semester = await Semester.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(semester);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteSemester = async (req, res) => {
  try {
    await Semester.findByIdAndDelete(req.params.id);
    res.json({ message: "Semester deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
