const Speciality = require("../models/Speciality");

exports.getSpecialities = async (req, res) => {
  try {
    const specialities = await Speciality.find().populate("departmentid");
    res.json(specialities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSpecialityById = async (req, res) => {
  try {
    const speciality = await Speciality.findById(req.params.id).populate("departmentid");
    if (!speciality) {
      return res.status(404).json({ message: "Speciality not found" });
    }
    res.json(speciality);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addSpeciality = async (req, res) => {
  try {
    const speciality = await Speciality.create(req.body);
    res.status(201).json(speciality);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateSpeciality = async (req, res) => {
  try {
    const speciality = await Speciality.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate("departmentid");
    
    if (!speciality) {
      return res.status(404).json({ message: "Speciality not found" });
    }
    res.json(speciality);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteSpeciality = async (req, res) => {
  try {
    const speciality = await Speciality.findByIdAndDelete(req.params.id);
    if (!speciality) {
      return res.status(404).json({ message: "Speciality not found" });
    }
    res.json({ message: "Speciality deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get specialities by department
exports.getSpecialitiesByDepartment = async (req, res) => {
  try {
    const specialities = await Speciality.find({ 
      departmentid: req.params.departmentid 
    }).populate("departmentid");
    res.json(specialities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 