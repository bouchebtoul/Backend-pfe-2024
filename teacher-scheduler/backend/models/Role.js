const mongoose = require("mongoose");

const RoleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Ensure no duplicate roles
  },
});

module.exports = mongoose.model("Role", RoleSchema);
