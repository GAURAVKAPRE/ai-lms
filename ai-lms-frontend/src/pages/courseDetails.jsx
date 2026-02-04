import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Quiz from "../components/Quiz";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [course, setCourse] = useState(null);
  const [user, setUser] = useState(null);
  const [lectures, setLectures] = useState([]);

  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState("");

  // 🎬 Video modal
  const [activeLecture, setActiveLecture] = useState(null);

  // 🧠 Quiz modal
  const [activeQuizLecture, setActiveQuizLecture] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);

  // 🤖 Ask AI (LECTURE LEVEL)
  const [activeAiLecture, setActiveAiLecture] = useState(null);
  const [question, setQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [asking, setAsking] = useState(false);

  // ================= FETCH COURSE + USER =================
  const fetchCourseAndUser = async () => {
    try {
      const userRes = await fetch("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = await userRes.json();

      const courseRes = await fetch(
        `http://localhost:5000/api/courses/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const courseData = await courseRes.json();

      setUser(userData);
      setCourse(courseData);
    } catch {
      setError("Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH LECTURES =================
  const fetchLectures = async () => {
    const res = await fetch(
      `http://localhost:5000/api/courses/${id}/lectures`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = await res.json();

    if (!res.ok) {
      setLectures([]);
      return;
    }

    setLectures(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchCourseAndUser();
  }, [id]);

  const isEnrolled =
    user?.enrolledCourses?.some(
      (cid) => String(cid) === String(course?._id)
    ) || false;

  useEffect(() => {
    if (isEnrolled) fetchLectures();
  }, [isEnrolled]);

  // ================= ENROLL =================
  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      await fetch(`http://localhost:5000/api/courses/${id}/enroll`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchCourseAndUser();
    } finally {
      setEnrolling(false);
    }
  };

  // ================= ASK AI (LECTURE LEVEL) =================
  const handleAskAI = async () => {
    if (!question.trim() || !activeAiLecture) return;

    try {
      setAsking(true);
      setAiResponse("");

      const res = await fetch(
        `http://localhost:5000/api/ai/ask/${activeAiLecture._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ question }),
        }
      );

      const data = await res.json();
      setAiResponse(data.answer);
    } finally {
      setAsking(false);
    }
  };

  if (loading) return <div className="text-center mt-20">Loading...</div>;
  if (error) return <div className="text-red-600 mt-20">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="text-indigo-600 mb-4">
        ← Back
      </button>

      <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
      <p className="text-gray-700 mb-6">{course.description}</p>

      {!isEnrolled ? (
        <button
          onClick={handleEnroll}
          disabled={enrolling}
          className="px-6 py-3 bg-green-600 text-white rounded"
        >
          {enrolling ? "Enrolling..." : "Enroll in Course"}
        </button>
      ) : (
        <>
          <h2 className="text-2xl font-semibold mb-4">Lectures</h2>

          {lectures.map((lec, i) => (
            <div key={lec._id} className="border p-5 mb-4 rounded bg-white">
              <h3 className="font-semibold mb-3">
                {i + 1}. {lec.title}
              </h3>

              <div className="flex gap-3 flex-wrap">
                {lec.videoUrl && (
                  <button
                    onClick={() => setActiveLecture(lec)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded text-sm"
                  >
                    ▶ Watch Video
                  </button>
                )}

                {lec.pdfUrl && (
                  <a
                    href={lec.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-green-600 text-white rounded text-sm"
                  >
                    📄 View PDF
                  </a>
                )}

                {lec.isChunked && (
                  <>
                    <button
                      onClick={() => {
                        setQuizLoading(true);
                        setActiveQuizLecture(lec);
                      }}
                      className="px-4 py-2 bg-purple-600 text-white rounded text-sm"
                    >
                      🧠 Take AI Quiz
                    </button>

                    <button
                      onClick={() => {
                        setActiveAiLecture(lec);
                        setQuestion("");
                        setAiResponse("");
                      }}
                      className="px-4 py-2 bg-pink-600 text-white rounded text-sm"
                    >
                      🤖 Ask AI
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </>
      )}

      {/* VIDEO MODAL */}
      {activeLecture && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="bg-white p-4 rounded w-full max-w-4xl relative">
            <button
              onClick={() => setActiveLecture(null)}
              className="absolute top-2 right-3 font-bold"
            >
              ✕
            </button>
            <video controls autoPlay className="w-full">
              <source src={activeLecture.videoUrl} type="video/mp4" />
            </video>
          </div>
        </div>
      )}

      {/* QUIZ MODAL */}
      {activeQuizLecture && (
        <Quiz
          lectureId={activeQuizLecture._id}
          onClose={() => {
            setActiveQuizLecture(null);
            setQuizLoading(false);
          }}
        />
      )}

      {/* ASK AI MODAL */}
      {activeAiLecture && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="bg-white rounded-lg p-5 w-full max-w-xl relative">
            <button
              onClick={() => setActiveAiLecture(null)}
              className="absolute top-2 right-3 font-bold"
            >
              ✕
            </button>

            <h3 className="text-xl font-semibold mb-3">
              🤖 Ask AI — {activeAiLecture.title}
            </h3>

            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full border p-3 rounded mb-3"
              placeholder="Ask a question from this lecture PDF..."
            />

            <button
              onClick={handleAskAI}
              disabled={asking}
              className="px-6 py-2 bg-purple-600 text-white rounded"
            >
              {asking ? "Thinking..." : "Ask AI"}
            </button>

            {aiResponse && (
              <div className="mt-4 p-4 bg-gray-100 rounded text-sm whitespace-pre-wrap">
                <strong>AI Response:</strong>
                <p className="mt-2">{aiResponse}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;
