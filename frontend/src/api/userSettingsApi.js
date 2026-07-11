import apiClient from './apiClient';

export const getUserSettings = () => {
  return apiClient.get('/api/v1/user-settings');
};

export const updateUserSettings = (settings) => {
  return apiClient.put('/api/v1/user-settings', settings);
};
