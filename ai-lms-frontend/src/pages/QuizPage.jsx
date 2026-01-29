import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const QuizPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  // ================= FETCH QUIZ =================
  useEffect(() => {
    const fetchQuiz = async () => {
      const res = await fetch(
        `http://localhost:5000/api/quizzes/${quizId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setQuiz(data);
      setLoading(false);
    };

    fetchQuiz();
  }, [quizId, token]);

  // ================= HANDLE OPTION SELECT =================
  const selectOption = (qIndex, optionIndex) => {
    setAnswers((prev) => {
      const updated = prev.filter(
        (a) => a.questionIndex !== qIndex
      );
      return [...updated, { questionIndex: qIndex, selectedOption: optionIndex }];
    });
  };

  // ================= SUBMIT QUIZ =================
  const submitQuiz = async () => {
    const res = await fetch(
      "http://localhost:5000/api/quizzes/submit",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          quizId,
          answers,
        }),
      }
    );

    const data = await res.json();
    setResult(data);
  };

  if (loading) return <div>Loading quiz...</div>;
  if (!quiz) return <div>Quiz not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={() => navigate(-1)}
        className="text-indigo-600 mb-4"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-6">Quiz</h1>

      {/* QUIZ QUESTIONS */}
      {!result &&
        quiz.questions.map((q, qIndex) => (
          <div key={qIndex} className="mb-6 p-4 border rounded">
            <p className="font-semibold mb-2">
              {qIndex + 1}. {q.question}
            </p>

            {q.options.map((opt, oIndex) => (
              <label key={oIndex} className="block mb-1">
                <input
                  type="radio"
                  name={`q-${qIndex}`}
                  onChange={() => selectOption(qIndex, oIndex)}
                  className="mr-2"
                />
                {opt}
              </label>
            ))}
          </div>
        ))}

      {/* SUBMIT BUTTON */}
      {!result && (
        <button
          onClick={submitQuiz}
          className="px-6 py-2 bg-indigo-600 text-white rounded"
        >
          Submit Quiz
        </button>
      )}

      {/* RESULTS */}
      {result && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4">
            Score: {result.score} / {result.totalQuestions}
          </h2>

          {result.results.map((r, index) => (
            <div
              key={index}
              className={`p-4 mb-3 rounded ${
                r.isCorrect ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <p className="font-semibold">{r.question}</p>
              <p>
                Your answer:{" "}
                {r.selectedOption !== null
                  ? r.selectedOption
                  : "Not answered"}
              </p>
              <p>
                Correct answer: {r.correctAnswer}
              </p>
              <p className="text-sm mt-1">
                💡 {r.explanation}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizPage;
