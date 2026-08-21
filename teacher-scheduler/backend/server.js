const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const { createServer } = require("http");
const { initializeSocket } = require("./socket");

dotenv.config();

const app = express();
const server = createServer(app); // Create HTTP server
const io = initializeSocket(server); // Initialize WebSocket

app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

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
app.use("/api", roleRoutes);
app.use("/api/rooms", roomRoutes);


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
