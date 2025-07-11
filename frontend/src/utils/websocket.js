class WebSocketManager {
  constructor() {
    this.ws = null;
    this.listeners = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
    this.isConnecting = false;
    this.shouldReconnect = true;
  }

  connect() {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;
    
    // Get WebSocket URL - always connect directly to backend
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    
    // For Docker/production, connect directly to backend port since it's exposed
    // For development, also connect directly to backend port
    const backendPort = import.meta.env.VITE_WS_PORT || '3742';
    const wsUrl = `${protocol}//${host}:${backendPort}`;

    console.log('🔌 Connecting to WebSocket:', wsUrl);

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('🔌 WebSocket connected');
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
      
      // Notify all listeners about connection
      this.listeners.forEach(listener => {
        if (listener.onConnect) {
          listener.onConnect();
        }
      });
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('🔌 WebSocket message received:', data);
        
        // Notify all listeners about the message
        this.listeners.forEach(listener => {
          if (listener.onMessage) {
            listener.onMessage(data);
          }
        });
      } catch (error) {
        console.error('🔌 Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('🔌 WebSocket disconnected');
      this.isConnecting = false;
      this.ws = null;
      
      // Notify all listeners about disconnection
      this.listeners.forEach(listener => {
        if (listener.onDisconnect) {
          listener.onDisconnect();
        }
      });

      // Attempt to reconnect if needed
      if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
        console.log(`🔌 Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        
        setTimeout(() => {
          this.connect();
        }, delay);
      }
    };

    this.ws.onerror = (error) => {
      console.error('🔌 WebSocket error:', error);
      this.isConnecting = false;
    };
  }

  addListener(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  disconnect() {
    this.shouldReconnect = false;
    if (this.ws) {
      this.ws.close();
    }
  }

  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

// Export a singleton instance
export const wsManager = new WebSocketManager();