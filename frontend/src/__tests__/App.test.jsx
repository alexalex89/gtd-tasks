import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock fetch
global.fetch = vi.fn();

describe('App - Basic Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    // Mock successful fetch responses
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([])
    });
  });

  it('renders without crashing', () => {
    render(<App />);
    // Just check that something renders
    expect(document.body).toBeInTheDocument();
  });

  it('shows the main heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('shows the menu button', () => {
    render(<App />);
    expect(screen.getByLabelText(/toggle menu/i)).toBeInTheDocument();
  });

  it('shows the add task button', () => {
    render(<App />);
    expect(screen.getByText(/add task/i)).toBeInTheDocument();
  });
});