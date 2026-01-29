// middlewares/roleMiddleware.js

const roleMiddleware = (requiredRole) => {
  return (req, res, next) => {
    // 🔐 Auth check
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // 🎓 Instructor role check
    if (requiredRole === "instructor") {
      if (!req.user.instructorProfile?.enabled) {
        return res
          .status(403)
          .json({ message: "Instructor access required" });
      }
      return next();
    }

    // 🔮 Future roles (admin, moderator, etc.)
    return res.status(403).json({ message: "Access denied" });
  };
};

module.exports = roleMiddleware;
