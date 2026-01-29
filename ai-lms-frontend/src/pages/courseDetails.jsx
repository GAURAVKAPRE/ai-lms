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
  const [progressMap, setProgressMap] = useState({});

  // 🔥 AI insights
  const [weakLectures, setWeakLectures] = useState([]);
  const [studyAdvice, setStudyAdvice] = useState(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState("");

  // 🎬 Video modal
  const [activeLecture, setActiveLecture] = useState(null);

  // 🧠 Quiz modal
  const [activeQuizLecture, setActiveQuizLecture] = useState(null);

  // 🤖 AI Tutor
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
    setLectures(await res.json());
  };

  // ================= FETCH PROGRESS (LectureProgress) =================
  const fetchProgress = async () => {
    const res = await fetch(
      `http://localhost:5000/api/progress/course/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();

    const map = {};
    data.forEach((p) => {
      map[p.lecture] = p.watchedPercent;
    });
    setProgressMap(map);
  };

  // ================= FETCH WEAK LECTURES =================
  const fetchWeakLectures = async () => {
    const res = await fetch(
      `http://localhost:5000/api/recommendations/weak/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    setWeakLectures(Array.isArray(data) ? data : []);
  };

  // ================= FETCH STUDY ADVICE =================
  const fetchStudyAdvice = async () => {
    try {
      setLoadingAdvice(true);
      const res = await fetch(
        `http://localhost:5000/api/study-advice/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setStudyAdvice(data);
    } finally {
      setLoadingAdvice(false);
    }
  };

  useEffect(() => {
    fetchCourseAndUser();
  }, [id]);

  const isEnrolled =
    course?.enrolledStudents?.some(
      (stu) => String(stu) === String(user?._id)
    ) || false;

  useEffect(() => {
    if (isEnrolled) {
      fetchLectures();
      fetchProgress();
      fetchWeakLectures();
    }
  }, [isEnrolled]);

  // ================= ENROLL =================
  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      await fetch(`http://localhost:5000/api/courses/${id}/enroll`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCourseAndUser();
    } finally {
      setEnrolling(false);
    }
  };

  // ================= VIDEO PROGRESS =================
  const handleVideoProgress = async (lectureId, video) => {
    if (!video.duration) return;

    const watchedPercent = Math.floor(
      (video.currentTime / video.duration) * 100
    );

    setProgressMap((prev) => ({
      ...prev,
      [lectureId]: Math.max(prev[lectureId] || 0, watchedPercent),
    }));

    await fetch(`http://localhost:5000/api/progress/${lectureId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        courseId: id,
        watchedPercent,
        timeSpent: 5,
      }),
    });
  };

  // ================= ASK AI =================
  const handleAskAI = async () => {
    if (!question.trim()) return;

    try {
      setAsking(true);
      setAiResponse("");

      const res = await fetch("http://localhost:5000/api/ai/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId: id, question }),
      });

      const data = await res.json();
      setAiResponse(data.answer);
    } finally {
      setAsking(false);
    }
  };

  if (loading) return <div className="text-center mt-20">Loading...</div>;
  if (error) return <div className="text-red-600 mt-20">{error}</div>;

  // ================= UI =================
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
              <h3 className="font-semibold mb-2">
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

                {lec.pdfUrl && (
                  <button
                    onClick={() => setActiveQuizLecture(lec)}
                    className="px-4 py-2 bg-purple-600 text-white rounded text-sm"
                  >
                    🧠 Take AI Quiz
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* 🔥 LEARNING INSIGHTS */}
          <hr className="my-10" />

          <h2 className="text-2xl font-semibold mb-4">
            📊 Your Learning Insights
          </h2>

          {weakLectures.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-300 p-4 rounded mb-6">
              <h3 className="font-semibold mb-2">⚠️ Weak Lectures</h3>
              <ul className="list-disc pl-5 text-sm">
                {weakLectures.map((w) => (
                  <li key={w._id}>
                    {w.lecture.title} – {w.watchedPercent}% watched
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-300 p-4 rounded">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">🤖 AI Study Advice</h3>
              <button
                onClick={fetchStudyAdvice}
                className="px-4 py-1 text-sm bg-blue-600 text-white rounded"
              >
                Get Advice
              </button>
            </div>

            {loadingAdvice && <p className="text-sm">Thinking...</p>}

            {studyAdvice?.advice && (
              <p className="text-sm mt-2">{studyAdvice.advice}</p>
            )}

            {studyAdvice?.suggestions && (
              <ul className="list-disc pl-5 text-sm mt-2">
                {studyAdvice.suggestions.map((s) => (
                  <li key={s.lectureId}>{s.message}</li>
                ))}
              </ul>
            )}
          </div>

          {/* 🤖 AI TUTOR */}
          <hr className="my-10" />
          <h2 className="text-2xl font-semibold mb-2">🤖 Ask AI Tutor</h2>

          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full border p-3 rounded mb-3"
            placeholder="Ask doubts from this course..."
          />

          <button
            onClick={handleAskAI}
            disabled={asking}
            className="px-6 py-2 bg-purple-600 text-white rounded"
          >
            {asking ? "Thinking..." : "Ask AI"}
          </button>

          {aiResponse && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <strong>AI Response:</strong>
              <p className="mt-2 text-sm whitespace-pre-wrap">
                {aiResponse}
              </p>
            </div>
          )}
        </>
      )}

      {/* 🎬 VIDEO MODAL */}
      {activeLecture && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="bg-white p-4 rounded w-full max-w-4xl relative">
            <button
              onClick={() => setActiveLecture(null)}
              className="absolute top-2 right-3 font-bold"
            >
              ✕
            </button>

            <video
              controls
              autoPlay
              playsInline
              onTimeUpdate={(e) =>
                handleVideoProgress(activeLecture._id, e.target)
              }
              className="w-full"
            >
              <source
                src={activeLecture.videoUrl}
                type="video/mp4"
              />
            </video>
          </div>
        </div>
      )}

      {/* 🧠 QUIZ MODAL */}
      {activeQuizLecture && (
        <Quiz
          lectureId={activeQuizLecture._id}
          onClose={() => setActiveQuizLecture(null)}
        />
      )}
    </div>
  );
};

export default CourseDetail;
