import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../test/test-utils';
import TaskCard from '../TaskCard';

describe('TaskCard - Basic Tests', () => {
  const mockTask = {
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
  };

  const mockProps = {
    task: mockTask,
    onEdit: vi.fn(),
    onComplete: vi.fn(),
    onToggleFocus: vi.fn(),
    onDelete: vi.fn(),
    isDarkMode: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders task title', () => {
    render(<TaskCard {...mockProps} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('renders task description', () => {
    render(<TaskCard {...mockProps} />);
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('renders checkbox', () => {
    render(<TaskCard {...mockProps} />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    render(<TaskCard {...mockProps} />);
    expect(screen.getByTitle('Add to focus')).toBeInTheDocument();
    expect(screen.getByTitle('Delete task')).toBeInTheDocument();
  });
});