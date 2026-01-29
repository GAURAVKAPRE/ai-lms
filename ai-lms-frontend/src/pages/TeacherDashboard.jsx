import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateCourseForm from "../pages/CreateCourseForm";

const TeacherDashboard = () => {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // 🔄 Fetch teacher profile + their courses
  const fetchTeacherData = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/auth");
      return;
    }

    try {
      // 👤 Get logged-in user
      const userRes = await fetch("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = await userRes.json();
      if (!userRes.ok) throw new Error("Session expired");

      // 🚫 Only instructors allowed
      if (!userData.instructorProfile?.enabled) {
        navigate("/dashboard");
        return;
      }

      setUser(userData);

      // 📚 Get instructor courses
      const courseRes = await fetch("http://localhost:5000/api/courses/my", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const courseData = await courseRes.json();
      setCourses(courseData);
    } catch (err) {
      console.error(err);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherData();
    // eslint-disable-next-line
  }, []);

  // 🚪 Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-gray-600">Loading teacher dashboard...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Teacher Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome, <span className="font-semibold">{user.name}</span>
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex gap-3 mt-4 sm:mt-0">
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg border hover:bg-gray-100 transition"
          >
            Logout
          </button>

          {!showCreateForm && (
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              Switch to Student View
            </button>
          )}
        </div>
      </div>

      {/* 📝 CREATE COURSE MODE */}
      {showCreateForm && (
        <CreateCourseForm
          onSuccess={() => {
            setShowCreateForm(false);
            fetchTeacherData();
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* 📚 DASHBOARD MODE */}
      {!showCreateForm && (
        <>
          <div className="mb-6">
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Create New Course
            </button>
          </div>

          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            My Courses
          </h2>

          {courses.length === 0 ? (
            <p className="text-gray-600">
              You have not created any courses yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div
                  key={course._id}
                  className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {course.title}
                  </h3>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {course.description}
                  </p>

                  <p className="text-sm text-gray-500">
                    Students enrolled:{" "}
                    <span className="font-medium">
                      {course.enrolledStudents?.length || 0}
                    </span>
                  </p>

                  <button
                    onClick={() =>
                      navigate(`/instructor/course/${course._id}`)
                    }
                    className="mt-4 w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    Manage Course
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TeacherDashboard;
