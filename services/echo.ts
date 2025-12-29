
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Define window property for Pusher to satisfy Echo requirements
(window as any).Pusher = Pusher;

export const initEcho = (token: string, apiUrl: string) => {
  const host = new URL(apiUrl).hostname;
  
  return new Echo({
    broadcaster: 'reverb',
    key: 'eschool_reverb_key', // This matches the VITE_REVERB_APP_KEY in Laravel .env
    wsHost: host,
    wsPort: 443,
    forceTLS: true,
    enabledTransports: ['ws', 'wss'],
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
