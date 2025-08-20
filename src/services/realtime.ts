import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

let echoInstance: Echo<any> | null = null;

export function getEcho(): Echo<any> {
  if (echoInstance) return echoInstance;

  const key = import.meta.env.VITE_REVERB_APP_KEY;
  const host = import.meta.env.VITE_REVERB_HOST;
  const port = import.meta.env.VITE_REVERB_PORT ?? 80;
  const scheme = import.meta.env.VITE_REVERB_SCHEME ?? 'https';
  const token = localStorage.getItem('auth-token');

  // Ensure Pusher client is globally available for Echo
  if (typeof window !== 'undefined' && !(window as any).Pusher) {
    (window as any).Pusher = Pusher;
  }

  echoInstance = new Echo({
    broadcaster: 'reverb',
    key,
    wsHost: host,
    wsPort: port,
    wssPort: port,
    forceTLS: scheme === 'https',
    enabledTransports: ['ws', 'wss'],
    auth: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  });

  return echoInstance;
}

export function resetEcho(): void {
  if (echoInstance) {
    try {
      // @ts-ignore
      echoInstance.disconnect && echoInstance.disconnect();
    } catch {}
  }
  echoInstance = null;
}


