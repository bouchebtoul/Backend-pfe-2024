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

// Get current semester (static for now)
exports.getCurrentSemester = async (req, res) => {
    try {
        // For now, return a static semester value
        res.json({
            name: '2024-2025 S2',
            year: '2024-2025',
            semester: 2,
            startDate: '2024-02-01',
            endDate: '2024-06-30',
            isActive: true
        });
    } catch (error) {
        console.error('Error getting current semester:', error);
        res.status(500).json({ message: 'Error getting current semester' });
    }
};
