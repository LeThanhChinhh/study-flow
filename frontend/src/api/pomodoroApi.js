import apiClient from './apiClient';

export const savePomodoroLog = (payload) => {
  return apiClient.post('/api/v1/pomodoro/log', payload);
};
