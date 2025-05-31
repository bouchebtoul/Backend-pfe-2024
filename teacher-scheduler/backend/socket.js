const socketIo = require("socket.io");

let io;

const initializeSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: "*", // Update this with frontend URL for security
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 A user connected:", socket.id);

    // Listen for schedule updates
    socket.on("updateSchedule", (data) => {
      console.log("📅 Schedule updated:", data);
      io.emit("scheduleUpdated", data); // Broadcast update to all clients
    });

    // Listen for teacher assignments updates
    socket.on("updateTeacher", (data) => {
      console.log("👨‍🏫 Teacher assignment updated:", data);
      io.emit("teacherUpdated", data); // Notify all clients
    });

    socket.on("newUser", (user) => {
        io.emit("userAdded", user); // Notify all clients
      });
      

    // Notify on user disconnection
    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = { initializeSocket, getIo };
