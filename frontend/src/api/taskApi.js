import apiClient from './apiClient';

export const getTasks = (params = {}) => {
  return apiClient.get('/api/v1/tasks', { params });
};

export const createTask = (payload) => {
  return apiClient.post('/api/v1/tasks', payload);
};

export const getTaskById = (taskId) => {
  return apiClient.get(`/api/v1/tasks/${taskId}`);
};

export const updateTask = (taskId, payload) => {
  return apiClient.put(`/api/v1/tasks/${taskId}`, payload);
};

export const deleteTask = (taskId) => {
  return apiClient.delete(`/api/v1/tasks/${taskId}`);
};
