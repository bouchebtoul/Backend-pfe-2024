const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const { createServer } = require("http");
const { initializeSocket } = require("./socket");

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Import routes
const semesterRoutes = require("./routes/semesterRoutes");
const moduleRoutes = require("./routes/moduleRoutes");
const userRoutes = require("./routes/userRoutes");
const yearRoutes = require("./routes/yearRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const gradeRoutes = require("./routes/gradeRoutes");
const levelRoutes = require("./routes/levelRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const authRoutes = require("./routes/authRoutes");
const roleRoutes = require("./routes/roleRoutes");
const roomRoutes = require("./routes/roomRoutes");
const specialityRoutes = require("./routes/specialityRoutes");
const affectationRoutes = require("./routes/affectationRoutes");
const sectionRoutes = require("./routes/sectionRoutes");
const groupRoutes = require("./routes/groupRoutes");
// Use routes
app.use("/api/semesters", semesterRoutes);
app.use("/api/modules", moduleRoutes);
app.use("/api/users", userRoutes);
app.use("/api/years", yearRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/levels", levelRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/specialities", specialityRoutes);
app.use("/api/affectations", affectationRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/groups", groupRoutes);

// Initialize Socket.IO
initializeSocket(httpServer);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
