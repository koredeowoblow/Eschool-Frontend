import axios from 'axios';

const BASE_URL = 'https://eschool-1.onrender.com/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // Increased to 60s for backend cold starts
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('eschool_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;

    if (status === 401) {
      localStorage.removeItem('eschool_token');
      localStorage.removeItem('eschool_user');
      if (!window.location.hash.includes('/login')) {
        window.location.replace('#/login');
      }
    }

    let errorMessage = error.message === 'timeout of 60000ms exceeded' 
      ? 'The server is taking too long to respond. It might be starting up. Please try again in a moment.'
      : 'A network error occurred. Please check your connection.';
    
    if (error.response?.data) {
      const data = error.response.data;
      if (typeof data === 'string') {
        errorMessage = data;
      } else if (data.message) {
        errorMessage = data.message;
      }
    }

    const enhancedError = new Error(errorMessage) as any;
    enhancedError.status = status || 500;
    enhancedError.isApiError = true;

    return Promise.reject(enhancedError);
  }
);

export default api;