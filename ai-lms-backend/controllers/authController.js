const User = require("../models/User");
const generateToken = require("../utils/generateToken");
 console.log("LOGIN JWT_SECRET:", process.env.JWT_SECRET);

// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1️⃣ Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2️⃣ Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 3️⃣ Create user
    const user = await User.create({
      name,
      email,
      password,
      role: "student", // default role
      instructorProfile: { enabled: false, coursesCreated: [] },
    });

    // 4️⃣ Send response with token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      instructorProfile: user.instructorProfile,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // 2️⃣ Find user
    const user = await User.findOne({ email });

    // 3️⃣ Check password
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        instructorProfile: user.instructorProfile,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================= GET LOGGED-IN USER =================
exports.getMe = async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    instructorProfile: req.user.instructorProfile,
  });
};
