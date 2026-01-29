// middleware/authMiddleware.js
console.log("PROTECT JWT_SECRET:", process.env.JWT_SECRET);

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  console.log("👉 Authorization header:", req.headers.authorization);

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  console.log("👉 Extracted token:", token);

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("👉 Decoded token:", decoded);

    const user = await User.findById(decoded.id).select("-password");
    console.log("👉 User from DB:", user);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("JWT ERROR:",error.name , error.message);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};



module.exports = { protect };
