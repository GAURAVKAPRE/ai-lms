import { useState } from "react";
import {
  generateQuizForLecture,
  submitQuiz as submitQuizApi,
} from "../api/quizApi";

const useQuiz = () => {
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // 🧠 Generate or fetch quiz
  const startQuiz = async (lectureId, token) => {
    try {
      setLoading(true);
      setError(null);

      const quizData = await generateQuizForLecture(lectureId, token);
      setQuiz(quizData);
      setAnswers([]);
      setResult(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  // 📝 Select an answer
  const selectAnswer = (questionIndex, selectedOption) => {
    setAnswers((prev) => {
      const updated = prev.filter(
        (a) => a.questionIndex !== questionIndex
      );

      updated.push({ questionIndex, selectedOption });
      return updated;
    });
  };

  // 🚀 Submit quiz
  const submitQuiz = async (token) => {
    if (!quiz) return;

    try {
      setLoading(true);
      const response = await submitQuizApi(
        quiz._id,
        answers,
        token
      );
      setResult(response);
    } catch (err) {
      setError(err?.response?.data?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return {
    quiz,
    questions: quiz?.questions || [],
    answers,
    loading,
    error,
    result,
    startQuiz,
    selectAnswer,
    submitQuiz,
  };
};

export default useQuiz;
