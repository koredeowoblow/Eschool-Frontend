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

    // 1. Handle Unauthenticated (401) - General Fallback
    // Only triggers auto-logout if we aren't already trying to login
    if (status === 401 && !config.url?.includes('/login')) {
      console.warn("Unauthenticated session detected. Purging credentials...");
      localStorage.removeItem('eschool_token');
      localStorage.removeItem('eschool_user');
      
      if (!window.location.hash.includes('/login')) {
        window.location.replace('#/login');
      }
      
      const authError = new Error('Session expired. Please login again.') as any;
      authError.status = 401;
      return Promise.reject(authError);
    }

    // 2. Production Server Wake-up / Retry Logic
    if (config && !config._isRetry) {
      const shouldRetry = (status && [502, 503, 504].includes(status)) || error.code === 'ECONNABORTED';
      
      if (shouldRetry && (config.retryCount || 0) < 3) {
        config.retryCount = (config.retryCount || 0) + 1;
        const delay = config.retryCount * 2000;
        console.warn(`Upstream connectivity issue (${status || 'Timeout'}). Attempting recovery ${config.retryCount}/3...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return api(config);
      }
    }

    // 3. Error Message Normalization & Validation Extraction
    let errorMessage = 'A network error occurred. Please check your connection.';
    
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      errorMessage = 'The system is taking a moment to initialize. Retrying connection...';
    } else if (error.response?.data) {
      const data = error.response.data;

      // PRIORITY 1: Explicit Laravel Validation Errors (422)
      if (status === 422 && data.errors) {
        const firstErrorKey = Object.keys(data.errors)[0];
        const firstErrorMessage = data.errors[firstErrorKey][0];
        errorMessage = firstErrorMessage || data.message || 'Validation failed';
      } 
      // PRIORITY 2: Server-provided explicit message or error
      else if (data.message || data.error) {
        errorMessage = data.message || data.error;
      }
      // PRIORITY 3: Fallback for Login specifically if server returns 401 without body
      else if (config.url?.includes('/login') && status === 401) {
        errorMessage = 'Invalid email address or password. Please try again.';
      }
      // PRIORITY 4: Other structured errors
      else if (typeof data === 'string') {
        errorMessage = data;
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