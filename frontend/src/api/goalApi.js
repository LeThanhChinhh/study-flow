import apiClient from './apiClient';

export const createGoal = (payload) => {
  return apiClient.post('/api/v1/goals', payload);
};

export const getGoals = () => {
  return apiClient.get('/api/v1/goals');
};

export const getGoalById = (goalId) => {
  return apiClient.get(`/api/v1/goals/${goalId}`);
};

export const updateGoal = (goalId, payload) => {
  return apiClient.put(`/api/v1/goals/${goalId}`, payload);
};

export const deleteGoal = (goalId) => {
  return apiClient.delete(`/api/v1/goals/${goalId}`);
};
