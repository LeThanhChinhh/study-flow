import apiClient from './apiClient';

export const uploadMaterial = (file, goalId) => {
  const formData = new FormData();
  formData.append('file', file);

  if (goalId) {
    formData.append('goalId', goalId);
  }

  return apiClient.post('/api/v1/materials/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getMaterialStatus = (jobId) => {
  return apiClient.get(`/api/v1/materials/status/${jobId}`);
};
