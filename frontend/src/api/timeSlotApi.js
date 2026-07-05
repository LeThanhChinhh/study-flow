import apiClient from './apiClient';

export const createTimeSlot = (payload) => {
  return apiClient.post('/api/v1/time-slots', payload);
};

export const getTimeSlots = () => {
  return apiClient.get('/api/v1/time-slots');
};

export const updateTimeSlot = (timeSlotId, payload) => {
  return apiClient.put(`/api/v1/time-slots/${timeSlotId}`, payload);
};

export const deleteTimeSlot = (timeSlotId) => {
  return apiClient.delete(`/api/v1/time-slots/${timeSlotId}`);
};
