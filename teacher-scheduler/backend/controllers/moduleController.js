const Module = require("../models/Module");

exports.addModule = async (req, res) => {
  try {
    const module = await Module.create(req.body);
    res.status(201).json(module);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getModules = async (req, res) => {
  try {
    const modules = await Module.find().populate("levelid departmentid semesterid");
    res.json(modules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateModule = async (req, res) => {
  try {
    const module = await Module.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(module);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteModule = async (req, res) => {
  try {
    await Module.findByIdAndDelete(req.params.id);
    res.json({ message: "Module deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
