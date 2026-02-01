import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const QuizPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  // ✅ quiz comes from navigation state
  const quiz = location.state?.quiz;

  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!quiz) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">Quiz data not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-indigo-600"
        >
          ← Go Back
        </button>
      </div>
    );
  }

  // ================= SELECT OPTION =================
  const selectOption = (qIndex, optionIndex) => {
    setAnswers((prev) => {
      const filtered = prev.filter(
        (a) => a.questionIndex !== qIndex
      );
      return [
        ...filtered,
        { questionIndex: qIndex, selectedOption: optionIndex },
      ];
    });
  };

  // ================= SUBMIT QUIZ =================
  const submitQuiz = async () => {
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
      setResult(data);
    } catch (err) {
      alert("Quiz submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  // ================= UI =================
  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={() => navigate(-1)}
        className="text-indigo-600 mb-4"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-6">🧠 Quiz</h1>

      {/* QUESTIONS */}
      {!result &&
        quiz.questions.map((q, qi) => (
          <div key={qi} className="mb-6 p-4 border rounded">
            <p className="font-semibold mb-2">
              {qi + 1}. {q.question}
            </p>

            {q.options.map((opt, oi) => (
              <label key={oi} className="block mb-1">
                <input
                  type="radio"
                  name={`q-${qi}`}
                  checked={answers.some(
                    (a) =>
                      a.questionIndex === qi &&
                      a.selectedOption === oi
                  )}
                  onChange={() => selectOption(qi, oi)}
                  className="mr-2"
                />
                {opt}
              </label>
            ))}
          </div>
        ))}

      {/* SUBMIT */}
      {!result && (
        <button
          onClick={submitQuiz}
          disabled={submitting}
          className="px-6 py-2 bg-indigo-600 text-white rounded"
        >
          {submitting ? "Submitting..." : "Submit Quiz"}
        </button>
      )}

      {/* RESULTS */}
      {result && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4">
            Score: {result.score} / {result.totalQuestions}
          </h2>

          {result.results.map((r, i) => (
            <div
              key={i}
              className={`p-4 mb-3 rounded ${
                r.isCorrect ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <p className="font-semibold">{r.question}</p>
              <p>Your answer: {r.selectedOption}</p>
              <p>Correct answer: {r.correctAnswer}</p>
              <p className="text-sm mt-1">💡 {r.explanation}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizPage;
