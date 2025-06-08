const Role = require("../models/Role");

// ✅ Get All Roles
const getRoles = async (req, res) => {
    try {
        const roles = await Role.find();
        res.json(roles);
    } catch (error) {
        res.status(500).json({ message: "Error fetching roles", error: error.message });
    }
};

// ✅ Get Role by ID
const getRoleById = async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);
        if (!role) {
            return res.status(404).json({ message: "Role not found" });
        }
        res.json(role);
    } catch (error) {
        res.status(500).json({ message: "Error fetching role", error: error.message });
    }
};

// ✅ Create a New Role
const createRole = async (req, res) => {
    try {
        const { name, permissions } = req.body;

        // Check if role already exists
        const existingRole = await Role.findOne({ name });
        if (existingRole) {
            return res.status(400).json({ message: "Role already exists" });
        }

        const role = new Role({ name, permissions });
        await role.save();

        res.status(201).json({ message: "Role created successfully", role });
    } catch (error) {
        res.status(500).json({ message: "Error creating role", error: error.message });
    }
};

// ✅ Update Role
const updateRole = async (req, res) => {
    try {
        const { name, permissions } = req.body;
        
        // Check if new name already exists (if name is being changed)
        if (name) {
            const existingRole = await Role.findOne({ 
                name, 
                _id: { $ne: req.params.id } 
            });
            if (existingRole) {
                return res.status(400).json({ message: "Role name already exists" });
            }
        }

        const role = await Role.findByIdAndUpdate(
            req.params.id,
            { name, permissions },
            { new: true, runValidators: true }
        );

        if (!role) {
            return res.status(404).json({ message: "Role not found" });
        }

        res.json({ message: "Role updated successfully", role });
    } catch (error) {
        res.status(500).json({ message: "Error updating role", error: error.message });
    }
};

// ✅ Delete Role
const deleteRole = async (req, res) => {
    try {
        // Check if role is being used by any users
        const User = require("../models/User");
        const usersWithRole = await User.countDocuments({ role: req.params.id });
        
        if (usersWithRole > 0) {
            return res.status(400).json({ 
                message: "Cannot delete role: It is assigned to users" 
            });
        }

        const role = await Role.findByIdAndDelete(req.params.id);
        if (!role) {
            return res.status(404).json({ message: "Role not found" });
        }

        res.json({ message: "Role deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting role", error: error.message });
    }
};

module.exports = {
    getRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole
};
