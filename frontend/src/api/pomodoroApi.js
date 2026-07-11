import apiClient from './apiClient';

export const savePomodoroLog = (payload) => {
  return apiClient.post('/api/v1/pomodoro/log', payload);
};

export const getPomodoroLogs = () => {
  return apiClient.get('/api/v1/pomodoro/logs')
}

export const getPomodoroLogsByTask = (taskId) => {
  return apiClient.get(`/api/v1/pomodoro/logs/by-task/${taskId}`)
}
