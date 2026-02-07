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

  // 🎬 Video
  const [activeLecture, setActiveLecture] = useState(null);

  // 🧠 Quiz
  const [activeQuizLecture, setActiveQuizLecture] = useState(null);

  // 🤖 Ask AI
  const [activeAiLecture, setActiveAiLecture] = useState(null);
  const [question, setQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [asking, setAsking] = useState(false);

  // 📘 Summary
  const [activeSummaryLecture, setActiveSummaryLecture] = useState(null);
  const [lectureSummary, setLectureSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);

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
    if (res.ok) setLectures(Array.isArray(data) ? data : []);
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

  // ================= FREE ENROLL =================
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

  // ================= PAID COURSE =================
  const handleBuyCourse = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/payments/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ courseId: course._id }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        alert(data.message);
        return;
      }

      openRazorpayCheckout(data);
    } catch {
      alert("Payment initiation failed");
    }
  };

  // ================= RAZORPAY =================
  const openRazorpayCheckout = (orderData) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "AI LMS",
      description: "Course Purchase",
      order_id: orderData.orderId,

      handler: async function (response) {
        try {
          const verifyRes = await fetch(
            "http://localhost:5000/api/payments/verify",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            }
          );

          const data = await verifyRes.json();
          if (!verifyRes.ok) {
            alert(data.message || "Payment verification failed");
            return;
          }

          alert("Payment successful! 🎉");
          window.location.reload();
        } catch {
          alert("Verification error");
        }
      },

      theme: { color: "#6366f1" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  // ================= ASK AI =================
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

  // ================= SUMMARY =================
  const fetchLectureSummary = async (lecture) => {
    try {
      setSummaryLoading(true);
      setLectureSummary("");
      setActiveSummaryLecture(lecture);

      const res = await fetch(
        `http://localhost:5000/api/lectures/${lecture._id}/summary`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to load summary");
        return;
      }

      setLectureSummary(data.summary);
    } finally {
      setSummaryLoading(false);
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

      {/* ✅ PAID vs FREE LOGIC */}
      {!isEnrolled && (
        <>
          {Number(course?.price) > 0 ? (
            <button
              onClick={handleBuyCourse}
              className="px-6 py-3 bg-indigo-600 text-white rounded"
            >
              Buy Course ₹{course.price}
            </button>
          ) : (
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="px-6 py-3 bg-green-600 text-white rounded"
            >
              {enrolling ? "Enrolling..." : "Enroll for Free"}
            </button>
          )}
        </>
      )}

      {isEnrolled && (
        <>
          <h2 className="text-2xl font-semibold mb-4 mt-6">Lectures</h2>

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
                      onClick={() => setActiveQuizLecture(lec)}
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

                    <button
                      onClick={() => fetchLectureSummary(lec)}
                      className="px-4 py-2 bg-yellow-500 text-white rounded text-sm"
                    >
                      📘 View Summary
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
          onClose={() => setActiveQuizLecture(null)}
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
                {aiResponse}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUMMARY MODAL */}
      {activeSummaryLecture && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl relative">
            <button
              onClick={() => {
                setActiveSummaryLecture(null);
                setLectureSummary("");
              }}
              className="absolute top-2 right-3 font-bold"
            >
              ✕
            </button>

            <h3 className="text-xl font-semibold mb-4">
              📘 Lecture Summary — {activeSummaryLecture.title}
            </h3>

            {summaryLoading ? (
              <p className="text-gray-600">Generating summary...</p>
            ) : (
              <div className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
                {lectureSummary}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;
