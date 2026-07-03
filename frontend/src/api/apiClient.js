import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const ACCESS_TOKEN_KEY = 'accessToken';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Gắn JWT token vào mọi request nếu user đã đăng nhập.
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Chuẩn hóa response và error để các page/context dùng dễ hơn.
 * Lưu ý: response thành công sẽ trả thẳng response.data.
 */
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const normalizedError = {
      message: 'An unexpected error occurred',
      status: null,
      errors: null,
      data: null,
    };

    if (error.response) {
      const responseData = error.response.data;

      normalizedError.status = error.response.status;
      normalizedError.data = responseData;
      normalizedError.errors = responseData?.errors || null;
      normalizedError.message =
        responseData?.message || `Request failed with status ${error.response.status}`;
    } else if (error.request) {
      normalizedError.message = 'No response from server. Please check your connection.';
    } else {
      normalizedError.message = error.message;
    }

    return Promise.reject(normalizedError);
  }
);

export default apiClient;
export { ACCESS_TOKEN_KEY };