// Test setup file
const { Pool } = require('pg');

// Mock database pool
const mockPool = {
  query: jest.fn(),
  connect: jest.fn(),
  end: jest.fn()
};

// Mock the database module
jest.mock('../database', () => ({
  pool: mockPool,
  initDB: jest.fn().mockResolvedValue()
}));

// Mock WebSocket
global.WebSocket = {
  OPEN: 1,
  CLOSED: 0
};

// Mock console methods to reduce noise in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks();
  
  // Mock console methods
  console.log = jest.fn();
  console.error = jest.fn();
});

afterEach(() => {
  // Restore console methods
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

// Export mock pool for use in tests
global.mockPool = mockPool;