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

  const [activeLecture, setActiveLecture] = useState(null);
  const [activeQuizLecture, setActiveQuizLecture] = useState(null);

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

  // ================= PAID FLOW =================
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
    } catch (err) {
      alert("Payment initiation failed");
    }
  };

  // ================= RAZORPAY CHECKOUT =================
  const openRazorpayCheckout = (orderData) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "AI LMS",
      description: "Course Purchase",
      order_id: orderData.orderId,

      // 🔐 STEP 5: VERIFY PAYMENT
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

          alert("Payment successful! You are now enrolled 🎉");
          window.location.reload(); // refresh to unlock lectures
        } catch (err) {
          console.error(err);
          alert("Verification error");
        }
      },

      theme: {
        color: "#6366f1",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
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

      {!isEnrolled && (
        <>
          {course.price === 0 ? (
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="px-6 py-3 bg-green-600 text-white rounded"
            >
              {enrolling ? "Enrolling..." : "Enroll for Free"}
            </button>
          ) : (
            <button
              onClick={handleBuyCourse}
              className="px-6 py-3 bg-indigo-600 text-white rounded"
            >
              Buy Course ₹{course.price}
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
    </div>
  );
};

export default CourseDetail;
