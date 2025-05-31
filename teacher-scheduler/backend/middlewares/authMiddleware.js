const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
    let token = req.header("Authorization");
    if (!token) return res.status(401).json({ message: "Access denied" });
  
    // Ensure token is formatted correctly
    if (token.startsWith("Bearer ")) {
      token = token.split(" ")[1]; // Extract token after "Bearer "
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).populate("role");
      next();
    } catch (error) {
      res.status(401).json({ message: "Invalid token" });
    }
  };
  
const adminMiddleware = (req, res, next) => {
  if (req.user.role.name !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admins only" });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };
