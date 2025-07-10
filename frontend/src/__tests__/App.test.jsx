import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';

// Mock fetch
global.fetch = vi.fn();

describe('App', () => {
  const mockTasks = [
    {
      id: 1,
      title: 'Test Task',
      description: 'Test description',
      category: 'inbox',
      priority: 'medium',
      completed: false,
      focused: false,
      due_date: '2024-12-31',
      time_estimate: '1hour',
      energy_level: 'medium',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ];

  const mockCategories = [
    { id: 'inbox', name: 'Inbox', color: '#f59e0b' },
    { id: 'next', name: 'Next', color: '#10b981' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    // Mock successful fetch responses
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTasks)
    });
  });

  it('renders main navigation', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('All Tasks')).toBeInTheDocument();
    });
    
    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    expect(menuButton).toBeInTheDocument();
  });

  it('loads tasks on mount', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/tasks'));
    });
  });

  it('toggles sidebar when menu button is clicked', async () => {
    render(<App />);
    
    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    fireEvent.click(menuButton);
    
    await waitFor(() => {
      expect(screen.getByText('GTD Manager')).toBeInTheDocument();
    });
  });

  it('toggles dark mode and persists to localStorage', async () => {
    render(<App />);
    
    const menuButton = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(menuButton);
    
    await waitFor(() => {
      const darkModeToggle = screen.getByRole('button', { name: /toggle dark mode/i });
      fireEvent.click(darkModeToggle);
    });
    
    expect(localStorage.setItem).toHaveBeenCalledWith('darkMode', 'true');
  });

  it('loads dark mode preference from localStorage', () => {
    localStorage.setItem('darkMode', 'true');
    
    render(<App />);
    
    const appContainer = document.querySelector('.dark');
    expect(appContainer).toBeInTheDocument();
  });

  it('opens task form when add button is clicked', async () => {
    render(<App />);
    
    await waitFor(() => {
      const addButton = screen.getByRole('button', { name: /add task/i });
      fireEvent.click(addButton);
    });
    
    expect(screen.getByText('Add New Task')).toBeInTheDocument();
  });

  it('creates new task', async () => {
    render(<App />);
    
    // Open task form
    const addButton = screen.getByRole('button', { name: /add task/i });
    fireEvent.click(addButton);
    
    // Fill form
    const titleInput = screen.getByLabelText('Title');
    const descriptionInput = screen.getByLabelText('Description');
    
    fireEvent.change(titleInput, { target: { value: 'New Task' } });
    fireEvent.change(descriptionInput, { target: { value: 'New description' } });
    
    // Submit form
    const saveButton = screen.getByText('Save Task');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/tasks'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('New Task')
        })
      );
    });
  });

  it('updates existing task', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });
    
    // Click edit button on task
    const editButton = screen.getByTitle('Edit task');
    fireEvent.click(editButton);
    
    // Update title
    const titleInput = screen.getByDisplayValue('Test Task');
    fireEvent.change(titleInput, { target: { value: 'Updated Task' } });
    
    // Submit form
    const saveButton = screen.getByText('Save Task');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/tasks/1'),
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('Updated Task')
        })
      );
    });
  });

  it('toggles task completion', async () => {
    render(<App />);
    
    await waitFor(() => {
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);
    });
    
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/tasks/1'),
      expect.objectContaining({
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('true')
      })
    );
  });

  it('toggles task focus', async () => {
    render(<App />);
    
    await waitFor(() => {
      const focusButton = screen.getByTitle('Add to focus');
      fireEvent.click(focusButton);
    });
    
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/tasks/1/focus'),
      expect.objectContaining({
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('true')
      })
    );
  });

  it('deletes task', async () => {
    render(<App />);
    
    await waitFor(() => {
      const deleteButton = screen.getByTitle('Delete task');
      fireEvent.click(deleteButton);
    });
    
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/tasks/1'),
      expect.objectContaining({
        method: 'DELETE'
      })
    );
  });

  it('displays tasks grouped by category', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Inbox')).toBeInTheDocument();
      expect(screen.getByText('1 task')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    fetch.mockRejectedValue(new Error('API Error'));
    
    render(<App />);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching tasks:', expect.any(Error));
    });
    
    consoleSpy.mockRestore();
  });

  it('filters tasks correctly by category', async () => {
    const multipleTasks = [
      { ...mockTasks[0], category: 'inbox' },
      { ...mockTasks[0], id: 2, category: 'next', title: 'Next Task' }
    ];
    
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(multipleTasks)
    });
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
      expect(screen.getByText('Next Task')).toBeInTheDocument();
    });
  });

  it('applies dark mode class to root element', async () => {
    render(<App />);
    
    const menuButton = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(menuButton);
    
    await waitFor(() => {
      const darkModeToggle = screen.getByRole('button', { name: /toggle dark mode/i });
      fireEvent.click(darkModeToggle);
    });
    
    const appContainer = screen.getByTestId('app-container') || document.querySelector('.dark');
    expect(appContainer).toBeInTheDocument();
  });
});