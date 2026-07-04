import apiClient from './apiClient';

export const getTasks = (params = {}) => {
  return apiClient.get('/api/v1/tasks', { params });
};
