const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(50) NOT NULL DEFAULT 'inbox',
        priority VARCHAR(20) DEFAULT 'medium',
        due_date DATE,
        completed BOOLEAN DEFAULT false,
        focused BOOLEAN DEFAULT false,
        position INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      ALTER TABLE tasks ADD COLUMN IF NOT EXISTS focused BOOLEAN DEFAULT false;
    `);
    
    await pool.query(`
      ALTER TABLE tasks ADD COLUMN IF NOT EXISTS time_estimate VARCHAR(20);
      ALTER TABLE tasks ADD COLUMN IF NOT EXISTS energy_level VARCHAR(20);
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
      CREATE INDEX IF NOT EXISTS idx_tasks_position ON tasks(position);
      CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
      CREATE INDEX IF NOT EXISTS idx_tasks_focused ON tasks(focused);
    `);
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

module.exports = {
  pool,
  initDB
};