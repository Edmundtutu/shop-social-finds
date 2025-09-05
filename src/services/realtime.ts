import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

let echoInstance: Echo<any> | null = null;

export function getEcho(): Echo<any> {
  if (echoInstance) return echoInstance;

  const key = import.meta.env.VITE_REVERB_APP_KEY;
  const host = import.meta.env.VITE_REVERB_HOST;
  const port = import.meta.env.VITE_REVERB_PORT ?? 80;
  const scheme = import.meta.env.VITE_REVERB_SCHEME ?? 'https';
  const token = localStorage.getItem('auth-token') || localStorage.getItem('auth_token');

  // Check for required configuration
  if (!key || !host) {
    console.warn('Missing Reverb configuration. Real-time features will not work.');
    console.warn('Required: VITE_REVERB_APP_KEY, VITE_REVERB_HOST');
    console.warn('Current values:', { key: !!key, host: !!host, port, scheme });
    throw new Error('Real-time service configuration missing');
  }

  // Ensure Pusher client is globally available for Echo
  if (typeof window !== 'undefined' && !(window as any).Pusher) {
    (window as any).Pusher = Pusher;
  }

  try {
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

    // Add connection event listeners for debugging
    if (echoInstance.connector && echoInstance.connector.pusher) {
      const pusher = echoInstance.connector.pusher;
      
      pusher.connection.bind('connected', () => {
        console.log('✅ Real-time connection established');
      });

      pusher.connection.bind('disconnected', () => {
        console.warn('❌ Real-time connection lost');
      });

      pusher.connection.bind('error', (error: any) => {
        console.error('🔥 Real-time connection error:', error);
      });
    }

    return echoInstance;
  } catch (error) {
    console.error('Failed to initialize Echo:', error);
    throw error;
  }
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


