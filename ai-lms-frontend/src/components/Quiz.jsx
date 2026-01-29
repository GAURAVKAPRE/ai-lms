import React, { useEffect, useState } from "react";
  

const Quiz = ({ lectureId, onClose }) => {
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // ================= FETCH / GENERATE QUIZ =================
  const fetchQuiz = async () => {
    try {
      console.log("🧠 Quiz opened for lecture:", lectureId);

      const res = await fetch(
        `http://localhost:5000/api/quizzes/generate/${lectureId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      console.log("📦 Quiz API response:", data);

      if (!res.ok) {
        throw new Error(data.message || "Quiz generation failed");
      }

      setQuiz(data.quiz);
    } catch (err) {
      console.error("❌ Quiz error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
    // eslint-disable-next-line
  }, []);

  // ================= SELECT ANSWER =================
  const handleSelect = (questionIndex, optionIndex) => {
    setAnswers((prev) => {
      const filtered = prev.filter(
        (a) => a.questionIndex !== questionIndex
      );
      return [...filtered, { questionIndex, selectedOption: optionIndex }];
    });
  };

  // ================= SUBMIT QUIZ =================
  const handleSubmit = async () => {
    if (!quiz) return;

    if (answers.length !== quiz.questions.length) {
      alert("Please answer all questions");
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch(
        `http://localhost:5000/api/quizzes/submit/${quiz._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ answers }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Quiz submission failed");
      }

      setResult(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ================= UI =================
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-3xl p-6 overflow-y-auto max-h-[90vh] relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-lg font-bold"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-4">🧠 AI Quiz</h2>

        {/* ================= LOADING ================= */}
        {loading && (
          <p className="text-gray-600">
            🤖 Generating quiz from lecture PDF...
          </p>
        )}

        {/* ================= ERROR ================= */}
        {!loading && error && (
          <div className="bg-red-100 border border-red-300 p-4 rounded">
            <p className="text-red-700 font-semibold">
              ❌ {error}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              This usually happens if the lecture has no PDF or PDF text
              extraction failed.
            </p>
          </div>
        )}

        {/* ================= RESULT ================= */}
        {result && (
          <div>
            <h3 className="text-xl font-semibold mb-4">
              🎯 Score: {result.score} / {result.totalQuestions}
            </h3>

            <div className="space-y-4">
              {result.results.map((r, i) => (
                <div
                  key={i}
                  className={`p-4 rounded ${
                    r.isCorrect ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  <p className="font-semibold">
                    Q{i + 1}. {r.question}
                  </p>

                  <p className="text-sm mt-1">
                    Your answer:{" "}
                    {r.selectedOption !== null
                      ? `Option ${r.selectedOption + 1}`
                      : "Not answered"}
                  </p>

                  {!r.isCorrect && (
                    <>
                      <p className="text-sm">
                        ✅ Correct answer: Option{" "}
                        {r.correctAnswer + 1}
                      </p>
                      <p className="text-sm italic mt-1">
                        💡 {r.explanation}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={onClose}
              className="mt-6 px-5 py-2 bg-indigo-600 text-white rounded"
            >
              Close
            </button>
          </div>
        )}

        {/* ================= QUESTIONS ================= */}
        {!loading && !error && quiz && !result && (
          <>
            {quiz.questions.map((q, qi) => (
              <div key={qi} className="mb-6">
                <p className="font-semibold mb-2">
                  Q{qi + 1}. {q.question}
                </p>

                <div className="space-y-2">
                  {q.options.map((opt, oi) => (
                    <label
                      key={oi}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={`q-${qi}`}
                        checked={answers.some(
                          (a) =>
                            a.questionIndex === qi &&
                            a.selectedOption === oi
                        )}
                        onChange={() => handleSelect(qi, oi)}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2 bg-indigo-600 text-white rounded"
            >
              {submitting ? "Submitting..." : "Submit Quiz"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Quiz;
