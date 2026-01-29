import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, instructorOnly = false }) => {
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  // ❌ Not logged in
  if (!token || !storedUser) {
    return <Navigate to="/auth" replace />;
  }

  let user;
  try {
    user = JSON.parse(storedUser);
  } catch (err) {
    console.error("Invalid user in localStorage", err);
    localStorage.clear();
    return <Navigate to="/auth" replace />;
  }

  // 🔒 Instructor-only protection
  if (instructorOnly && !user?.instructorProfile?.enabled) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PrivateRoute;
