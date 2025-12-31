
import axios from 'axios';

const BASE_URL = 'https://eschool-1.onrender.com/api/v1';
let isRedirecting = false;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120000, 
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
  async (error) => {
    const status = error.response?.status;
    const config = error.config as any;

    if (status === 401 && !config.url?.includes('/login')) {
      if (!isRedirecting) {
        isRedirecting = true;
        console.warn("Unauthenticated session. Executing purge...");
        localStorage.removeItem('eschool_token');
        localStorage.removeItem('eschool_user');
        
        if (!window.location.hash.includes('/login')) {
          window.location.replace('#/login');
        }
        
        // Reset flag after a delay to allow page transition
        setTimeout(() => { isRedirecting = false; }, 3000);
      }
      
      const authError = new Error('Session expired.') as any;
      authError.status = 401;
      return Promise.reject(authError);
    }

    if (config && !config._isRetry) {
      const shouldRetry = (status && [502, 503, 504].includes(status)) || error.code === 'ECONNABORTED';
      
      if (shouldRetry && (config.retryCount || 0) < 3) {
        config.retryCount = (config.retryCount || 0) + 1;
        const delay = config.retryCount * 2000;
        
        await new Promise(resolve => setTimeout(resolve, delay));
        config._isRetry = true;
        return api(config);
      }
    }

    let errorMessage = 'A network error occurred.';
    if (error.response?.data) {
      const data = error.response.data;
      if (status === 422 && data.errors) {
        const firstErrorKey = Object.keys(data.errors)[0];
        errorMessage = data.errors[firstErrorKey][0];
      } else if (data.message || data.error) {
        errorMessage = data.message || data.error;
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
