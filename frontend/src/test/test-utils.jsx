import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Custom render function that includes providers
const customRender = (ui, options = {}) => {
  const AllTheProviders = ({ children }) => {
    return (
      <BrowserRouter>
        {children}
      </BrowserRouter>
    );
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
};

// Sample task data for testing
export const mockTask = {
  id: 1,
  title: 'Test Task',
  description: 'Test task description',
  category: 'inbox',
  priority: 'medium',
  completed: false,
  focused: false,
  due_date: '2024-12-31',
  time_estimate: '1hour',
  energy_level: 'medium',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

export const mockCompletedTask = {
  ...mockTask,
  id: 2,
  title: 'Completed Task',
  completed: true
};

export const mockFocusedTask = {
  ...mockTask,
  id: 3,
  title: 'Focused Task',
  focused: true
};

export const mockCategories = [
  { id: 'inbox', name: 'Inbox', color: '#f59e0b' },
  { id: 'next', name: 'Next', color: '#10b981' },
  { id: 'waiting', name: 'Waiting', color: '#f97316' },
  { id: 'scheduled', name: 'Scheduled', color: '#3b82f6' },
  { id: 'someday', name: 'Someday', color: '#8b5cf6' }
];

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };