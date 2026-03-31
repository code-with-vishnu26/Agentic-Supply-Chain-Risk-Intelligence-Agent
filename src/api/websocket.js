const WS_URL = 'ws://localhost:8000/ws';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = {};
    this.isConnected = false;
    this.reconnectAttempts = 0;
  }

  connect() {
    if (this.socket) return;
    
    this.socket = new WebSocket(WS_URL);
    
    this.socket.onopen = () => {
      console.log('WebSocket Connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this._emit('connection_change', true);
    };

    this.socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        // Backend format: { channel: "events", data: { ... } }
        if (payload.channel) {
          this._emit(payload.channel, payload.data);
        }
      } catch (err) {
        console.error("WS Parse error", err);
      }
    };

    this.socket.onclose = () => {
      console.log('WebSocket Disconnected');
      this.isConnected = false;
      this.socket = null;
      this._emit('connection_change', false);
      
      // Auto reconnect loop
      if (this.reconnectAttempts < 5) {
        setTimeout(() => {
          this.reconnectAttempts++;
          this.connect();
        }, 3000 * this.reconnectAttempts);
      }
    };
  }

  subscribe(channel, callback) {
    if (!this.listeners[channel]) {
      this.listeners[channel] = [];
    }
    this.listeners[channel].push(callback);
    
    return () => {
      this.listeners[channel] = this.listeners[channel].filter(cb => cb !== callback);
    };
  }

  _emit(channel, data) {
    if (this.listeners[channel]) {
      this.listeners[channel].forEach(callback => callback(data));
    }
  }
}

export const wsService = new WebSocketService();
// Start connection lazily where needed or immediately
// wsService.connect();
