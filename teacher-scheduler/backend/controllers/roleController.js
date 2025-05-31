const Role = require("../models/Role");

// ✅ Create a New Role
const createRole = async (req, res) => {
  try {
    const { name } = req.body;

    // Check if role already exists
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(400).json({ message: "Role already exists" });
    }

    const role = new Role({ name });
    await role.save();

    res.status(201).json({ message: "Role created successfully", role });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = { createRole };
