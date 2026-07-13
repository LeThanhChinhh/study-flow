import apiClient from './apiClient';

/**
 * Đăng ký tài khoản mới.
 * Backend nhận payload: { username, email, password }
 */
export const register = (payload) => {
  return apiClient.post('/api/v1/auth/register', payload);
};

/**
 * Đăng nhập bằng email hoặc username.
 * Backend nhận payload: { identifier, password }
 */
export const login = (payload) => {
  return apiClient.post('/api/v1/auth/login', payload);
};

/**
 * Lấy thông tin user hiện tại từ JWT token.
 */
export const getMe = () => {
  return apiClient.get('/api/v1/auth/me');
};

/**
 * Cập nhật username của user hiện tại.
 */
export const updateUsername = (payload) => {
  return apiClient.patch('/api/v1/auth/me/username', payload);
};

export const authApi = {
  register,
  login,
  getMe,
  updateUsername,
};