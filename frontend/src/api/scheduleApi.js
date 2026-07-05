import apiClient from './apiClient';

export const generateSchedule = (payload) => {
  return apiClient.post('/api/v1/schedules/generate', payload);
};
