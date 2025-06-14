const Group = require("../models/Group");

// Get all groups
exports.getGroups = async (req, res) => {
  try {
    const groups = await Group.find().populate({
      path: 'sectionid',
      populate: {
        path: 'levelid'
      }
    });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get group by ID
exports.getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate({
      path: 'sectionid',
      populate: {
        path: 'levelid'
      }
    });
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get groups by section
exports.getGroupsBySection = async (req, res) => {
  try {
    const groups = await Group.find({ sectionid: req.params.sectionId }).populate({
      path: 'sectionid',
      populate: {
        path: 'levelid'
      }
    });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new group
exports.addGroup = async (req, res) => {
  const group = new Group({
    name: req.body.name,
    sectionid: req.body.sectionid,
    capacity: req.body.capacity,
    description: req.body.description
  });

  try {
    const newGroup = await group.save();
    const populatedGroup = await Group.findById(newGroup._id).populate({
      path: 'sectionid',
      populate: {
        path: 'levelid'
      }
    });
    res.status(201).json(populatedGroup);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update group
exports.updateGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    Object.assign(group, req.body);
    const updatedGroup = await group.save();
    const populatedGroup = await Group.findById(updatedGroup._id).populate({
      path: 'sectionid',
      populate: {
        path: 'levelid'
      }
    });
    res.json(populatedGroup);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete group
exports.deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    await group.deleteOne();
    res.json({ message: "Group deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 