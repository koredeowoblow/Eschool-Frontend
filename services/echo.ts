import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Define window property for Pusher to satisfy Echo requirements
(window as any).Pusher = Pusher;

/**
 * Initializes Laravel Echo for cross-domain Reverb connection
 * @param token Sanctum Bearer Token
 * @param apiUrl Base API URL (e.g., https://api.eschool.com/api/v1)
 */
export const initEcho = (token: string, apiUrl: string) => {
  // Configured as per Render dashboard screenshot
  return new Echo({
    broadcaster: 'reverb',
    key: '5fvfekx0ohg4absh6lpx', 
    wsHost: 'eschool-1.onrender.com',
    wsPort: 443,
    wssPort: 443,
    forceTLS: true,
    enabledTransports: ['ws', 'wss'],
    // CORRECTED: Ensure the prefixed route for cross-domain auth is used
    authEndpoint: `${apiUrl}/broadcasting/auth`, 
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    },
  });
};

export default initEcho;