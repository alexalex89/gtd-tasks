const http = require('http');
const WebSocket = require('ws');
const { initDB } = require('./database');
const { app, setClients } = require('./app');

const PORT = process.env.PORT || 3742;
const DEBUG = process.env.DEBUG === 'true';

// Create HTTP server and WebSocket server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Set();
setClients(clients);

// WebSocket connection handler
wss.on('connection', (ws) => {
  clients.add(ws);
  if (DEBUG) console.log('🔌 WebSocket client connected. Total clients:', clients.size);
  
  ws.on('close', () => {
    clients.delete(ws);
    if (DEBUG) console.log('🔌 WebSocket client disconnected. Total clients:', clients.size);
  });
  
  ws.on('error', (error) => {
    if (DEBUG) console.error('🔌 WebSocket error:', error);
    clients.delete(ws);
  });
});

server.listen(PORT, async () => {
  await initDB();
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready on ws://localhost:${PORT}`);
  if (DEBUG) {
    console.log('🐛 Debug mode enabled - detailed logging active');
    console.log('Environment variables:');
    console.log(`  NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`  DEBUG: ${process.env.DEBUG}`);
    console.log(`  DB_HOST: ${process.env.DB_HOST}`);
    console.log(`  DB_PORT: ${process.env.DB_PORT}`);
  }
});

// Export for testing
module.exports = app;