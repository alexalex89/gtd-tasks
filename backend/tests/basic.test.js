const request = require('supertest');

// Mock database
const mockQuery = jest.fn();
const mockPool = { query: mockQuery };

jest.mock('../database', () => ({
  pool: mockPool,
  initDB: jest.fn()
}));

const { app } = require('../app');

describe('Backend API Basic Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/tasks returns tasks', async () => {
    const mockTasks = [{ id: 1, title: 'Test Task' }];
    
    mockQuery
      .mockResolvedValueOnce({ rows: [] }) // overdue check
      .mockResolvedValueOnce({ rows: mockTasks }); // tasks query

    const response = await request(app).get('/api/tasks');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('GET /api/tasks handles errors', async () => {
    mockQuery.mockRejectedValue(new Error('DB error'));

    const response = await request(app).get('/api/tasks');
    
    expect(response.status).toBe(500);
  });

  test('DELETE /api/tasks/:id works', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] });

    const response = await request(app).delete('/api/tasks/1');
    
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Task deleted successfully');
  });

  test('DELETE /api/tasks/:id handles non-existent task', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const response = await request(app).delete('/api/tasks/999');
    
    expect(response.status).toBe(404);
  });
});