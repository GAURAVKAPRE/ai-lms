import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUserAndCourses = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/auth");

    try {
      const userRes = await fetch("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = await userRes.json();
      if (!userRes.ok) throw new Error();

      setUser(userData);

      const courseRes = await fetch("http://localhost:5000/api/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(await courseRes.json());
    } catch {
      localStorage.clear();
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserAndCourses();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/auth");
  };

  const handleBecomeInstructor = async () => {
  const token = localStorage.getItem("token");

  await fetch("http://localhost:5000/api/instructor/enable", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  // 🔁 REFRESH USER DATA
  const userRes = await fetch("http://localhost:5000/api/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });

  const updatedUser = await userRes.json();
  setUser(updatedUser);

  navigate("/teacher");
};


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-medium text-gray-600">
          Loading dashboard...
        </p>
      </div>
    );
  }

  const isInstructor = user?.instructorProfile?.enabled;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Student Dashboard</h1>
          <p className="text-gray-600">Welcome, {user.name}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleLogout}
            className="px-4 py-2 border rounded"
          >
            Logout
          </button>

          {isInstructor ? (
            <button
              onClick={() => navigate("/teacher")}
              className="px-4 py-2 bg-indigo-600 text-white rounded"
            >
              Teacher Dashboard
            </button>
          ) : (
            <button
              onClick={handleBecomeInstructor}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Become Teacher
            </button>
          )}
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Available Courses</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course._id}
            className="bg-white rounded shadow p-5"
          >
            <h3 className="font-semibold mb-2">{course.title}</h3>
            <p className="text-sm text-gray-600 mb-3">
              {course.description}
            </p>

            <button
              onClick={() => navigate(`/courses/${course._id}`)}
              className="w-full bg-indigo-600 text-white py-2 rounded"
            >
              View Course
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
