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
    // Trim and normalize token to prevent whitespace issues
    const cleanToken = token.trim().replace(/^["'](.+)["']$/, '$1');

    // Explicitly use the set method for headers if available (Axios 1.x+)
    if (config.headers && typeof config.headers.set === 'function') {
      config.headers.set('Authorization', `Bearer ${cleanToken}`);
    } else {
      config.headers.Authorization = `Bearer ${cleanToken}`;
    }

    // Log for debugging (only in development)
    if (window.location.hostname === 'localhost') {
      console.debug(`[API Request] ${config.method?.toUpperCase()} ${config.url} | Auth: Bearer ${cleanToken.substring(0, 10)}...`);
    }
  } else if (window.location.hostname === 'localhost') {
    console.debug(`[API Request] ${config.method?.toUpperCase()} ${config.url} | No Token Found`);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const config = error.config as any;
    const url = config.url || '';

    // Check if it's a broadcasting auth request or a chat-related endpoint
    const isBroadcastingAuth = url.includes('broadcasting/auth');
    const isChatEndpoint = url.includes('/chats');
    const hasToken = !!localStorage.getItem('eschool_token');

    // 401 handling: Only purge if we actually had a token (expired) 
    // AND it's not a chat/handshake endpoint (to avoid logout loops)
    if (status === 401 && !url.includes('/login') && !isBroadcastingAuth && !isChatEndpoint && hasToken) {
      if (!isRedirecting) {
        isRedirecting = true;
        console.warn(`Unauthenticated session detected on [${url}]. Executing purge...`);

        localStorage.removeItem('eschool_token');
        localStorage.removeItem('eschool_user');

        if (!window.location.hash.includes('/login')) {
          window.location.replace('#/login');
        }

        setTimeout(() => { isRedirecting = false; }, 3000);
      }

      const authError = new Error('Session expired.') as any;
      authError.status = 401;
      return Promise.reject(authError);
    }

    // Silence errors that shouldn't break the app (broadcasting auth or chat synchronization)
    if (status === 401 && (isBroadcastingAuth || isChatEndpoint || !hasToken)) {
      console.debug(`401 suppressed on [${url}]: Handshake or chat sync delay.`);
      return Promise.reject(error);
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