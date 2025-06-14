const Section = require("../models/Section");

// Get all sections
exports.getSections = async (req, res) => {
  try {
    const sections = await Section.find().populate('levelid');
    res.json(sections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get section by ID
exports.getSectionById = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id).populate('levelid');
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }
    res.json(section);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get sections by level
exports.getSectionsByLevel = async (req, res) => {
  try {
    const sections = await Section.find({ levelid: req.params.levelId }).populate('levelid');
    res.json(sections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new section
exports.addSection = async (req, res) => {
  const section = new Section({
    number: req.body.number,
    levelid: req.body.levelid,
    capacity: req.body.capacity,
    description: req.body.description
  });

  try {
    const newSection = await section.save();
    res.status(201).json(newSection);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update section
exports.updateSection = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    Object.assign(section, req.body);
    const updatedSection = await section.save();
    res.json(updatedSection);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete section
exports.deleteSection = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    await section.deleteOne();
    res.json({ message: "Section deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 