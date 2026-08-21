const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    capacity: { type: Number, required: true },
    type: { 
        type: String, 
        required: true,
        enum: ['lecture', 'tutorial', 'lab']
    }
});

module.exports = mongoose.model("Room", RoomSchema);