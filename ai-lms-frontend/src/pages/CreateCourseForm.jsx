import React, { useEffect, useState } from "react";

const CreateCourseForm = ({
  mode = "create",
  initialData = null,
  courseId = null,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    level: "Beginner",
    price: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Pre-fill data when editing
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        category: initialData.category || "",
        level: initialData.level || "Beginner",
        price: initialData.price || 0,
      });
    }
  }, [mode, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Session expired. Please login again.");
      return;
    }

    // ✅ ONLY validate what backend actually needs
    if (!formData.title.trim() || !formData.description.trim()) {
      setError("Title and description are required");
      return;
    }

    try {
      setLoading(true);

      const url =
        mode === "edit"
          ? `http://localhost:5000/api/courses/${courseId}`
          : "http://localhost:5000/api/courses";

      const method = mode === "edit" ? "PUT" : "POST";

      // ✅ SEND ONLY RELEVANT FIELDS
      const payload = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price) || 0,
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Operation failed");

      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {mode === "edit" ? "Edit Course" : "Create New Course"}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Course Title"
          className="w-full px-4 py-2 border rounded-lg"
        />

        <textarea
          name="description"
          rows="4"
          value={formData.description}
          onChange={handleChange}
          placeholder="Course Description"
          className="w-full px-4 py-2 border rounded-lg"
        />

        {/* Optional UI-only fields (not sent to backend) */}
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleChange}
          placeholder="Category (optional)"
          className="w-full px-4 py-2 border rounded-lg"
        />

        <select
          name="level"
          value={formData.level}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg"
        >
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>

        <input
          type="number"
          name="price"
          min="0"
          value={formData.price}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg"
        />

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg"
          >
            {loading
              ? "Saving..."
              : mode === "edit"
              ? "Update Course"
              : "Create Course"}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border rounded-lg"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateCourseForm;
