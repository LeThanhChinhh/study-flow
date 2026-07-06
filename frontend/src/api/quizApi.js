import apiClient from './apiClient';

export const generateQuiz = (payload) => {
  return apiClient.post('/api/v1/quizzes/generate', payload);
};

export const getQuizzesByTask = (taskId) => {
  return apiClient.get(`/api/v1/quizzes/by-task/${taskId}`);
};

export const submitQuiz = (payload) => {
  return apiClient.post('/api/v1/quizzes/submit', payload);
};
