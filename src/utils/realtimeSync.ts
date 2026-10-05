/**
 * Real-time synchronization utility for BebêAqui
 * Coordinates instant sync between PC (Caixa/Gerência) and Portable Terminals (Maquininhas Ton/Stone / Celulares)
 */

export type RealtimeEventType = 
  | 'ORDER_CREATED_FROM_TERMINAL'
  | 'ORDER_UPDATED'
  | 'ORDER_PAID'
  | 'TABLE_STATUS_CHANGED'
  | 'TERMINAL_PING'
  | 'STOCK_UPDATED';

export interface RealtimeEventPayload {
  type: RealtimeEventType;
  timestamp: string;
  sourceTerminalId?: string;
  sourceTerminalName?: string;
  data: any;
}

const CHANNEL_NAME = 'bebeaqui_pos_realtime_sync';

// Global BroadcastChannel instance
let channel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    channel = new BroadcastChannel(CHANNEL_NAME);
  }
} catch (e) {
  console.warn('BroadcastChannel not supported in this environment');
}

/**
 * Play a synthesized Web Audio chime (no external MP3 asset needed)
 */
export const playNotificationChime = (type: 'order' | 'pay' | 'sync' = 'order') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'pay') {
      // Pleasant cash/payment success double chime: 587.33Hz (D5) -> 880.0Hz (A5)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.setValueAtTime(880.0, now + 0.12);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.45);
    } else if (type === 'sync') {
      // Quick gentle blip
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.setValueAtTime(783.99, now + 0.08);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else {
      // New Order chime: 523.25Hz (C5) -> 659.25Hz (E5) -> 783.99Hz (G5)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.09);
      osc.frequency.setValueAtTime(783.99, now + 0.18);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc.start(now);
      osc.stop(now + 0.55);
    }
  } catch (err) {
    // Audio autoplay might be blocked before first user click
  }
};

/**
 * Dispatch a realtime event to all tabs, windows and devices
 */
export const dispatchRealtimeEvent = (type: RealtimeEventType, data: any, sourceTerminalId?: string, sourceTerminalName?: string) => {
  const event: RealtimeEventPayload = {
    type,
    timestamp: new Date().toISOString(),
    sourceTerminalId,
    sourceTerminalName,
    data
  };

  // 1. BroadcastChannel (immediate inter-tab/window)
  if (channel) {
    channel.postMessage(event);
  }

  // 2. localStorage fallback for cross-window events
  try {
    localStorage.setItem('bebeaqui_realtime_ping', JSON.stringify({ ...event, _nonce: Math.random() }));
  } catch (e) {
    // Ignore storage quota
  }

  // Trigger sound effect for the sender too if desired
  if (type === 'ORDER_PAID') {
    playNotificationChime('pay');
  } else if (type === 'ORDER_CREATED_FROM_TERMINAL') {
    playNotificationChime('order');
  }
};

/**
 * Subscribe to realtime events
 */
export const subscribeToRealtimeEvents = (callback: (event: RealtimeEventPayload) => void) => {
  const handleBroadcast = (msg: MessageEvent) => {
    if (msg.data && msg.data.type) {
      callback(msg.data as RealtimeEventPayload);
    }
  };

  const handleStorage = (e: StorageEvent) => {
    if (e.key === 'bebeaqui_realtime_ping' && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (parsed && parsed.type) {
          callback(parsed as RealtimeEventPayload);
        }
      } catch (err) {
        // Ignore JSON error
      }
    }
  };

  if (channel) {
    channel.addEventListener('message', handleBroadcast);
  }
  window.addEventListener('storage', handleStorage);

  return () => {
    if (channel) {
      channel.removeEventListener('message', handleBroadcast);
    }
    window.removeEventListener('storage', handleStorage);
  };
};
