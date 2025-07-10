const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const WebSocket = require('ws');
const { pool, initDB } = require('./database');

const app = express();
const PORT = process.env.PORT || 3742;
const DEBUG = process.env.DEBUG === 'true';

// Debug logging middleware
if (DEBUG) {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, req.body);
    next();
  });
}

app.use(cors());
app.use(bodyParser.json());

// Create HTTP server and WebSocket server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Set();

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

// Function to check and mark overdue tasks as focused
async function checkAndMarkOverdueTasks() {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Find tasks that are due or overdue and not yet focused
    const result = await pool.query(
      'UPDATE tasks SET focused = true WHERE due_date <= $1 AND focused = false AND completed = false RETURNING *',
      [today]
    );
    
    // Broadcast updates for each task that was marked as focused
    result.rows.forEach(task => {
      broadcastTaskUpdate('update', task);
    });
    
    if (result.rows.length > 0 && DEBUG) {
      console.log(`🎯 Marked ${result.rows.length} overdue tasks as focused`);
    }
    
    return result.rows;
  } catch (error) {
    console.error('Error checking overdue tasks:', error);
    return [];
  }
}

// Function to broadcast task updates to all connected clients
function broadcastTaskUpdate(action, task = null) {
  if (clients.size === 0) return;
  
  const message = JSON.stringify({
    type: 'task_update',
    action, // 'create', 'update', 'delete'
    task,
    timestamp: new Date().toISOString()
  });
  
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
  
  if (DEBUG) console.log(`📡 Broadcasted ${action} to ${clients.size} clients`);
}

app.get('/api/tasks', async (req, res) => {
  try {
    // First, check and mark overdue tasks as focused
    await checkAndMarkOverdueTasks();
    
    const { category } = req.query;
    let query = 'SELECT * FROM tasks';
    let params = [];
    
    if (category) {
      query += ' WHERE category = $1';
      params = [category];
    }
    
    query += ' ORDER BY position ASC, created_at ASC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description, category, priority, due_date, focused, time_estimate, energy_level } = req.body;
    
    const maxPositionResult = await pool.query(
      'SELECT COALESCE(MAX(position), 0) as max_position FROM tasks WHERE category = $1',
      [category || 'inbox']
    );
    const newPosition = maxPositionResult.rows[0].max_position + 1;
    
    // Check if the task is overdue and should be automatically focused
    const today = new Date().toISOString().split('T')[0];
    const shouldBeFocused = focused || (due_date && due_date <= today);
    
    const result = await pool.query(
      'INSERT INTO tasks (title, description, category, priority, due_date, focused, position, time_estimate, energy_level) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [title, description, category || 'inbox', priority || 'medium', due_date, shouldBeFocused, newPosition, time_estimate || null, energy_level || null]
    );
    
    const newTask = result.rows[0];
    broadcastTaskUpdate('create', newTask);
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, priority, due_date, completed, focused, time_estimate, energy_level } = req.body;
    
    // Check if the task should be automatically focused due to overdue date
    const today = new Date().toISOString().split('T')[0];
    const shouldBeFocused = focused || (due_date && due_date <= today && !completed);
    
    const result = await pool.query(
      'UPDATE tasks SET title = $1, description = $2, category = $3, priority = $4, due_date = $5, completed = $6, focused = $7, time_estimate = $8, energy_level = $9, updated_at = CURRENT_TIMESTAMP WHERE id = $10 RETURNING *',
      [title, description, category, priority, due_date, completed, shouldBeFocused, time_estimate || null, energy_level || null, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const updatedTask = result.rows[0];
    broadcastTaskUpdate('update', updatedTask);
    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/tasks/:id/position', async (req, res) => {
  try {
    const { id } = req.params;
    const { position, category } = req.body;
    
    const result = await pool.query(
      'UPDATE tasks SET position = $1, category = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [position, category, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const updatedTask = result.rows[0];
    broadcastTaskUpdate('update', updatedTask);
    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task position:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/tasks/:id/focus', async (req, res) => {
  try {
    const { id } = req.params;
    const { focused } = req.body;
    
    const result = await pool.query(
      'UPDATE tasks SET focused = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [focused, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const updatedTask = result.rows[0];
    broadcastTaskUpdate('update', updatedTask);
    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task focus:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const deletedTask = result.rows[0];
    broadcastTaskUpdate('delete', deletedTask);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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