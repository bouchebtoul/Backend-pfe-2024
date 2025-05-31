const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Role = require("../models/Role");
const fs = require("fs");

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" } // Short expiry for security
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.REFRESH_SECRET,
    { expiresIn: "7d" } // Longer expiry
  );

  // Log tokens to the terminal
  console.log("\n===== GENERATED TOKENS =====");
  console.log("Access Token:", accessToken);
  console.log("Refresh Token:", refreshToken);
  console.log("===========================\n");

  // Save tokens to a file (for debugging)
  fs.appendFileSync("tokens.log", `\nAccess Token: ${accessToken}\nRefresh Token: ${refreshToken}\n\n`);

  return { accessToken, refreshToken };
};


// ✅ Admin Registers a New User
const registerUser = async (req, res) => {
  try {
    const { fullname, email, password, role } = req.body;

    // Ensure the request is from an Admin
    const adminUser = await User.findById(req.user.id).populate("role");
    if (!adminUser || adminUser.role.name !== "admin") {
      return res.status(403).json({ message: "Forbidden: Only Admin can create users" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // 🔹 Find role by name and get its ObjectId
    const roleData = await Role.findOne({ name: role });
    if (!roleData) return res.status(400).json({ message: "Invalid role" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔥 Use roleData._id instead of role name
    const user = new User({ fullname, email, password: hashedPassword, role: roleData._id });

    await user.save();
    res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


// ✅ User loginUser
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 🔹 Populate the 'role' field to get role details
    const user = await User.findOne({ email }).populate("role");

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate Access & Refresh Tokens
    const { accessToken, refreshToken } = generateTokens(user);
    console.log("Login Response:", { accessToken, refreshToken });

    res.status(200).json({
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        email: user.email,
        fullname: user.fullname,
        role: user.role.name,  
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Refresh Token
const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(403).json({ message: "Refresh Token is required" });

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid refresh token" });

    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "User not found" });

    // 🔹 Generate New Tokens
    const tokens = generateTokens(user);
    res.json(tokens);
  });
};

// ✅ Export Functions
module.exports = { registerUser, loginUser, refreshToken };
