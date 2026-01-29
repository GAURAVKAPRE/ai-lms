import React, { useState } from "react";

const CreateCourse = ({ onCourseCreated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();

    // 🔐 TOKEN GUARD (VERY IMPORTANT)
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Session expired. Please login again.");
      return; // ⛔ prevents Bearer null
    }

    // 🧪 Basic validation
    if (!title.trim() || !description.trim()) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create course");
      }

      // ✅ Success
      onCourseCreated?.(data);
      setTitle("");
      setDescription("");
      alert("✅ Course created successfully");
    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleCreate}>
      <input
        placeholder="Course Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Course"}
      </button>
    </form>
  );
};

export default CreateCourse;
