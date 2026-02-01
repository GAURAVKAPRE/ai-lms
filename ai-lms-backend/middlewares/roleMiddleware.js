const roleMiddleware = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (
      requiredRole === "instructor" &&
      !req.user.instructorProfile?.enabled
    ) {
      return res
        .status(403)
        .json({ message: "Instructor access required" });
    }

    next();
  };
};

export default roleMiddleware;
