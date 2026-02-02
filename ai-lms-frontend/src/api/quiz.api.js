import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Generate OR fetch quiz for a lecture
export const generateQuizForLecture = async (lectureId, token) => {
  const response = await axios.post(
    `${API_URL}/api/quizzes/generate/${lectureId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// Get quiz by ID (optional, for refresh)
export const getQuizById = async (quizId, token) => {
  const response = await axios.get(
    `${API_URL}/api/quizzes/${quizId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// Submit quiz
export const submitQuiz = async (quizId, answers, token) => {
  const response = await axios.post(
    `${API_URL}/api/quizzes/submit/${quizId}`,
    { answers },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};
