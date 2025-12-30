
import axios, { AxiosError } from 'axios';

const BASE_URL = 'https://eschool-1.onrender.com/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120000, 
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

api.interceptors.response.use(undefined, async (err: AxiosError) => {
  const config = err.config as any;
  if (!config) return Promise.reject(err);
  
  if (config.retryCount === undefined) config.retryCount = 0;
  
  const shouldRetry = (err.response?.status && [502, 503, 504].includes(err.response.status)) || err.code === 'ECONNABORTED';
  
  if (shouldRetry && config.retryCount < 3) {
    config.retryCount += 1;
    const delay = config.retryCount * 2000;
    console.warn(`Production Server Wake-up: Retry attempt ${config.retryCount} in ${delay}ms...`);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return api(config);
  }

  return Promise.reject(err);
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
    
    if (status === 401) {
      localStorage.removeItem('eschool_token');
      localStorage.removeItem('eschool_user');
      if (!window.location.hash.includes('/login')) {
        window.location.replace('#/login');
      }
    }

    let errorMessage = 'A network error occurred. Please check your connection.';
    
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      errorMessage = 'The system is taking a moment to initialize. Retrying connection...';
    } else if (error.response?.data) {
      const data = error.response.data;
      if (typeof data === 'string') {
        errorMessage = data;
      } else if (data.message) {
        errorMessage = data.message;
      } else if (data.error) {
        errorMessage = data.error;
      }
    }

    const enhancedError = new Error(errorMessage) as any;
    enhancedError.status = status || 500;
    enhancedError.isApiError = true;
    enhancedError.originalError = error;

    return Promise.reject(enhancedError);
  }
);

export default api;
