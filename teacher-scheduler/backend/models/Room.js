const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  capacity: { type: Number, required: true },
  type: {
    type: [String],
    required: true,
    enum: ['LECTURE', 'TUTORIAL', 'WORKSHOP']
  }
});

module.exports = mongoose.model("Room", RoomSchema); 