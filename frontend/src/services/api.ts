import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to inject active organization context and access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('taskflow_access_token');
  const orgId = localStorage.getItem('taskflow_org_id') || '6afd42f398491b4d9c8da07c'; // default dev org

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (orgId) {
    config.headers['x-organization-id'] = orgId;
  }
  return config;
});

// Response interceptor to handle silent token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(
          'http://localhost:5000/api/v1/auth/refresh',
          {},
          { withCredentials: true }
        );
        const newToken = res.data?.data?.accessToken;
        if (newToken) {
          localStorage.setItem('taskflow_access_token', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch {
        // Refresh token expired or revoked
        localStorage.removeItem('taskflow_access_token');
      }
    }
    return Promise.reject(error);
  }
);
