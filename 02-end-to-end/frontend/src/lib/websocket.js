/**
 * WebSocket Client Abstraction
 * 
 * This module provides a mock WebSocket client for development.
 * Replace with real WebSocket connection when backend is ready.
 * 
 * Real-time sync flow:
 * 1. User connects to session via WebSocket
 * 2. On code change, client sends 'code-update' event
 * 3. Server broadcasts update to all connected clients
 * 4. Clients apply received changes to their editor
 */

// Real WebSocket implementation
let wsInstance = null;

class RealWebSocket {
  constructor(sessionId) {
    this.sessionId = sessionId;
    this.listeners = new Map();
    // Default to localhost:8080 if not specified
    const token = localStorage.getItem('token');
    const wsUrl = `ws://localhost:8080/sessions/${sessionId}?token=${token}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      this.emit('connected', { sessionId });
    };

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        // Map backend event types to frontend event types if needed
        // Backend: type, data

        // Handle "connected" message from server which contains userId
        if (msg.type === 'connected') {
          // this.emit('connected', msg.data); // Already emitted on open, but maybe we need userId
        } else {
          this.emit(msg.type, msg.data);
        }
      } catch (e) {
        console.error('Failed to parse WS message:', e);
      }
    };

    this.ws.onclose = () => {
      this.emit('disconnected', { sessionId });
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }

  send(event, data) {
    if (this.ws.readyState === WebSocket.OPEN) {
      const message = {
        type: event,
        ...data // Flatten data into the message or keep it structured? 
        // Backend expects: type, and ...? 
        // Wait, backend client.go unmarshals generic map.
        // It checks msg["type"].
        // If I send {type: 'code-update', code: '...', ...}, it works.
      };
      // Merge data properties into message if they are not colliding
      // Or just send data as fields.
      // My backend implementation broadcasts the raw message mostly.
      // So if frontend sends `send('code-update', {code: '...'})`
      // We should send JSON string: `{"type": "code-update", "code": "..."}`

      const payload = { type: event, ...data };
      this.ws.send(JSON.stringify(payload));
    } else {
      console.warn('WebSocket not connected');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
    this.listeners.clear();
  }
}

export const connectToSession = (sessionId) => {
  if (wsInstance) {
    wsInstance.disconnect();
  }
  wsInstance = new RealWebSocket(sessionId);
  return wsInstance;
};

export const getConnection = () => wsInstance;

export const disconnect = () => {
  if (wsInstance) {
    wsInstance.disconnect();
    wsInstance = null;
  }
};
