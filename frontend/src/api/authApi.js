import apiClient from './apiClient';


export const register = (payload) => {
  return apiClient.post('/api/v1/auth/register', payload);
};

export const login = (payload) => {
  return apiClient.post('/api/v1/auth/login', payload);
};

export const getMe = () => {
  return apiClient.get('/api/v1/auth/me');
};

export const updateUsername = (payload) => {
  return apiClient.patch('/api/v1/auth/me/username', payload);
};

export const authApi = {
  register,
  login,
  getMe,
  updateUsername,
};