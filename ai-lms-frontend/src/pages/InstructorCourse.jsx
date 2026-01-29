import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const InstructorCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const [course, setCourse] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showLectureForm, setShowLectureForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 🎥 which video is currently open
  const [activeVideoId, setActiveVideoId] = useState(null);

  const [lectureForm, setLectureForm] = useState({
    title: "",
    description: "",
    videoFile: null,
    pdfFile: null,
  });

  // 🔐 Instructor guard
  useEffect(() => {
    if (!user?.instructorProfile?.enabled) {
      navigate("/dashboard");
    }
  }, []);

  // ================= FETCH =================
  const fetchCourse = async () => {
    const res = await fetch(`http://localhost:5000/api/courses/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    setCourse(data);
  };

  const fetchLectures = async () => {
    const res = await fetch(
      `http://localhost:5000/api/courses/${id}/lectures`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    setLectures(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    const load = async () => {
      try {
        await fetchCourse();
        await fetchLectures();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // ================= CREATE LECTURE =================
  const handleSubmitLecture = async () => {
    if (!lectureForm.title.trim()) {
      alert("Lecture title required");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("title", lectureForm.title);
      formData.append("description", lectureForm.description);

      if (lectureForm.videoFile) {
        formData.append("video", lectureForm.videoFile);
      }
      if (lectureForm.pdfFile) {
        formData.append("pdf", lectureForm.pdfFile);
      }

      const res = await fetch(
        `http://localhost:5000/api/courses/${id}/lectures`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("Lecture created successfully");
      setShowLectureForm(false);
      setLectureForm({
        title: "",
        description: "",
        videoFile: null,
        pdfFile: null,
      });
      fetchLectures();
    } catch (err) {
      alert(err.message || "Lecture creation failed");
    } finally {
      setSubmitting(false);
    }
  };

  // ================= DELETE =================
  const handleDeleteLecture = async (lectureId) => {
    if (!window.confirm("Delete this lecture?")) return;

    await fetch(`http://localhost:5000/api/lectures/${lectureId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchLectures();
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error) return <div className="text-red-600 mt-10">{error}</div>;

  // ================= UI =================
  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <button onClick={() => navigate("/teacher")} className="text-indigo-600">
        ← Back
      </button>

      <div className="bg-white p-6 shadow rounded mb-6">
        <h1 className="text-3xl font-bold">{course?.title}</h1>
        <p className="text-gray-600">{course?.description}</p>
      </div>

      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">Lectures</h2>
        <button
          onClick={() => setShowLectureForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          + Create Lecture
        </button>
      </div>

      {showLectureForm && (
        <div className="bg-white p-6 shadow rounded mb-6">
          <input
            className="w-full border p-2 mb-2"
            placeholder="Lecture title"
            value={lectureForm.title}
            onChange={(e) =>
              setLectureForm({ ...lectureForm, title: e.target.value })
            }
          />

          <textarea
            className="w-full border p-2 mb-3"
            placeholder="Lecture description"
            value={lectureForm.description}
            onChange={(e) =>
              setLectureForm({ ...lectureForm, description: e.target.value })
            }
          />

          <input
            type="file"
            accept="video/*"
            onChange={(e) =>
              setLectureForm({ ...lectureForm, videoFile: e.target.files[0] })
            }
            className="mb-3"
          />

          <input
            type="file"
            accept="application/pdf"
            onChange={(e) =>
              setLectureForm({ ...lectureForm, pdfFile: e.target.files[0] })
            }
            className="mb-4"
          />

          <button
            onClick={handleSubmitLecture}
            disabled={submitting}
            className="bg-indigo-600 text-white px-4 py-2 rounded"
          >
            {submitting ? "Uploading..." : "Add Lecture"}
          </button>
        </div>
      )}

      <div className="bg-white p-6 shadow rounded">
        {lectures.length === 0 ? (
          <p className="text-gray-500">No lectures created yet.</p>
        ) : (
          lectures.map((lec, i) => (
            <div key={lec._id} className="border p-4 rounded mb-6">
              <h3 className="font-semibold mb-2">
                {i + 1}. {lec.title}
              </h3>

              {/* 🎥 VIDEO */}
              {lec.videoUrl ? (
                activeVideoId === lec._id ? (
                  <video
                    controls
                    preload="metadata"
                    playsInline
                    controlsList="nodownload"
                    className="w-full max-w-lg rounded border mb-3"
                  >
                    <source src={lec.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <button
                    onClick={() =>
                      setActiveVideoId(
                        activeVideoId === lec._id ? null : lec._id
                      )
                    }
                    className="text-indigo-600 font-medium mb-3"
                  >
                    ▶ Watch Video
                  </button>
                )
              ) : (
                <p className="text-gray-400 mb-3">No video</p>
              )}

              {/* 📄 PDF */}
              {lec.pdfUrl ? (
                <a
                  href={lec.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-green-600 block mb-2"
                >
                  📄 View PDF
                </a>
              ) : (
                <p className="text-gray-400 mb-2">No PDF</p>
              )}

              <button
                onClick={() => handleDeleteLecture(lec._id)}
                className="text-red-600"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default InstructorCourse;
