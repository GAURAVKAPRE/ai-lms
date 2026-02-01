import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import InstructorCourse from "./pages/InstructorCourse";
import CourseDetail from "./pages/CourseDetails";
import PrivateRoute from "./components/PrivateRoute";

import "./app.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />

        {/* Student Dashboard */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* Course Detail (Student View / Lectures / AI Quiz Modal) */}
        <Route
          path="/courses/:id"
          element={
            <PrivateRoute>
              <CourseDetail />
            </PrivateRoute>
          }
        />

        {/* Teacher Dashboard */}
        <Route
          path="/teacher"
          element={
            <PrivateRoute>
              <TeacherDashboard />
            </PrivateRoute>
          }
        />

        {/* Instructor Manage Course */}
        <Route
          path="/instructor/course/:id"
          element={
            <PrivateRoute>
              <InstructorCourse />
            </PrivateRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Auth />} />
      </Routes>
    </Router>
  );
}

export default App;
