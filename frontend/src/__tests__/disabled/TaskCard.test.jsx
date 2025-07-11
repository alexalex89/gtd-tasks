import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../test/test-utils';
import TaskCard from '../TaskCard';
import { mockTask, mockCompletedTask, mockFocusedTask, mockCategories } from '../../test/test-utils';

describe('TaskCard', () => {
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

  it('renders task title and description', () => {
    render(<TaskCard {...mockProps} />);
    
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test task description')).toBeInTheDocument();
  });

  it('shows task metadata correctly', () => {
    render(<TaskCard {...mockProps} />);
    
    expect(screen.getByText(/Dec 31, 2024/)).toBeInTheDocument();
    expect(screen.getByText(/1 hour/)).toBeInTheDocument();
    expect(screen.getByText(/Med/)).toBeInTheDocument();
  });

  it('renders checkbox for task completion', () => {
    render(<TaskCard {...mockProps} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('shows completed task with checked checkbox', () => {
    render(<TaskCard {...mockProps} task={mockCompletedTask} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('shows focused task with focus indicator', () => {
    render(<TaskCard {...mockProps} task={mockFocusedTask} />);
    
    const focusButton = screen.getByTitle('Remove from focus');
    expect(focusButton).toBeInTheDocument();
  });

  it('calls onComplete when checkbox is clicked', () => {
    render(<TaskCard {...mockProps} />);
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    expect(mockProps.onComplete).toHaveBeenCalledWith(mockTask);
  });

  it('calls onToggleFocus when focus button is clicked', () => {
    render(<TaskCard {...mockProps} />);
    
    const focusButton = screen.getByTitle('Add to focus');
    fireEvent.click(focusButton);
    
    expect(mockProps.onToggleFocus).toHaveBeenCalledWith(mockTask.id, true);
  });

  it('calls onEdit when task is clicked', () => {
    render(<TaskCard {...mockProps} />);
    
    const taskTitle = screen.getByText('Test Task');
    fireEvent.click(taskTitle);
    
    expect(mockProps.onEdit).toHaveBeenCalledWith(mockTask);
  });

  it('calls onDelete when delete button is clicked', () => {
    render(<TaskCard {...mockProps} />);
    
    const deleteButton = screen.getByTitle('Delete task');
    fireEvent.click(deleteButton);
    
    expect(mockProps.onDelete).toHaveBeenCalledWith(mockTask.id);
  });

  it('applies dark mode styling when isDarkMode is true', () => {
    const { container } = render(<TaskCard {...mockProps} isDarkMode={true} />);
    
    const taskCard = container.querySelector('.task-card');
    expect(taskCard).toHaveClass('task-card-dark');
  });

  it('shows priority correctly', () => {
    render(<TaskCard {...mockProps} />);
    
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });

  it('handles tasks without due date', () => {
    const taskWithoutDueDate = { ...mockTask, due_date: null };
    render(<TaskCard {...mockProps} task={taskWithoutDueDate} />);
    
    expect(screen.queryByText(/Dec|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov/)).not.toBeInTheDocument();
  });

  it('handles tasks without time estimate', () => {
    const taskWithoutTimeEstimate = { ...mockTask, time_estimate: null };
    render(<TaskCard {...mockProps} task={taskWithoutTimeEstimate} />);
    
    expect(screen.queryByText('1 hour')).not.toBeInTheDocument();
  });

  it('prevents text selection during scroll on mobile', () => {
    const { container } = render(<TaskCard {...mockProps} />);
    
    const taskCard = container.querySelector('.task-card');
    
    // Simulate touch start
    fireEvent.touchStart(taskCard, {
      touches: [{ clientX: 100, clientY: 100 }]
    });
    
    // Simulate touch move (scrolling)
    fireEvent.touchMove(taskCard, {
      touches: [{ clientX: 100, clientY: 150 }]
    });
    
    expect(taskCard).toHaveClass('select-none');
  });
});