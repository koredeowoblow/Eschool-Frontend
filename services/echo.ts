import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Define window property for Pusher to satisfy Echo requirements
(window as any).Pusher = Pusher;

/**
 * Initializes Laravel Echo for cross-domain Reverb connection using Sanctum.
 * @param apiUrl The base URL of the API
 * @param token The current Bearer token
 */
export const initEcho = (apiUrl: string, token: string) => {
  // Defensive check for token
  if (!token) {
    console.warn("Echo initialization aborted: Missing authentication token.");
    return null;
  }

  const cleanToken = token.trim().replace(/^["'](.+)["']$/, '$1');
  console.debug(`[Echo Init] Initializing with token: ${cleanToken.substring(0, 10)}...`);

  // Use relative path to leverage Vite proxy and avoid CORS issues
  // Backend defines broadcasting routes with 'api/v1' prefix in bootstrap/app.php
  const authEndpoint = '/api/v1/broadcasting/auth';

  console.debug(`[Echo Init] Auth Endpoint: ${authEndpoint} (Proxied)`);

  const echo = new Echo({
    broadcaster: 'reverb',
    key: '5fvfekx0ohg4absh6lpx',
    wsHost: 'eschool-1.onrender.com', // Explicit host for production
    wsPort: 443,
    wssPort: 443,
    forceTLS: true,
    enabledTransports: ['ws', 'wss'],
    authEndpoint: authEndpoint,
    auth: {
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    },
  });

  echo.connector.pusher.connection.bind('error', (err: any) => {
    console.error('[Echo Error] Connection Error:', err);
  });

  return echo;
};

export default initEcho;