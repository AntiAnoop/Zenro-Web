
import { supabase } from './supabaseClient';

type SignalType = 'login' | 'join' | 'offer' | 'answer' | 'candidate' | 'chat' | 'session_status' | 'get_status';

interface SignalMessage {
  type: SignalType;
  payload: any;
  from: string;
  to?: string; 
}

class SignalingService {
  private channel: any;
  private userId: string;
  private listeners: Map<string, Function[]>;

  constructor() {
    this.userId = Math.random().toString(36).substring(7);
    this.listeners = new Map();

    // Connect to Supabase Realtime Channel
    this.channel = supabase.channel('zenro-live-classroom', {
      config: {
        broadcast: { self: false }, // Don't receive our own messages
      },
    });

    this.channel
      .on('broadcast', { event: 'signal' }, ({ payload }: { payload: SignalMessage }) => {
        this.handleIncomingMessage(payload);
      })
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Connected to Signaling Server (Supabase)');
        }
      });
  }

  private handleIncomingMessage(data: SignalMessage) {
    // Filter messages meant for specific users
    if (data.to && data.to !== this.userId) return;
    
    // Safety check: Filter out messages sent by ourselves (redundant with self:false but good practice)
    if (data.from === this.userId) return;

    this.emitLocal(data.type, data.payload, data.from);
  }

  public getMyId() {
    return this.userId;
  }

  public async send(type: SignalType, payload: any, to?: string) {
    const msg: SignalMessage = {
      type,
      payload,
      from: this.userId,
      to
    };

    try {
      await this.channel.send({
        type: 'broadcast',
        event: 'signal',
        payload: msg,
      });
    } catch (error) {
      console.error("Failed to send signal:", error);
    }
  }

  public on(event: SignalType, callback: (payload: any, from: string) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  public off(event: SignalType, callback: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      this.listeners.set(event, eventListeners.filter(cb => cb !== callback));
    }
  }

  private emitLocal(event: string, payload: any, from: string) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(cb => cb(payload, from));
    }
  }
}

export const signaling = new SignalingService();
