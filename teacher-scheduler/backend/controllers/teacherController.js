const Teacher = require("../models/Teacher");

exports.getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find()
      .populate("gradeid")
      .populate("departmentid");
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate("gradeid")
      .populate("departmentid");
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addTeacher = async (req, res) => {
  try {
    const { firstName, lastName, gradeid, departmentid } = req.body;
    const teacher = await Teacher.create({
      firstName,
      lastName,
      gradeid,
      departmentid
    });
    res.status(201).json(teacher);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateTeacher = async (req, res) => {
  try {
    const { firstName, lastName, gradeid, departmentid } = req.body;
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, gradeid, departmentid },
      { new: true }
    );
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    res.json(teacher);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    res.json({ message: "Teacher deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
