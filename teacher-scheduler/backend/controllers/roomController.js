const Room = require("../models/Room");

exports.addRoom = async (req, res) => {
    try {
        const room = await Room.create(req.body);
        res.status(201).json(room);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getRooms = async (req, res) => {
    try {
        const { type } = req.query;
        const query = type ? { type } : {};
        const rooms = await Room.find(query);
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateRoom = async (req, res) => {
    try {
        const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }
        res.json(room);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteRoom = async (req, res) => {
    try {
        const room = await Room.findByIdAndDelete(req.params.id);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }
        res.json({ message: "Room deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};