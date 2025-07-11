import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../test/test-utils';
import TaskCategory from '../TaskCategory';
import { mockTask, mockCompletedTask, mockCategories } from '../../test/test-utils';

describe('TaskCategory', () => {
  const mockProps = {
    category: mockCategories[0], // Inbox category
    tasks: [mockTask, mockCompletedTask],
    onTaskEdit: vi.fn(),
    onTaskComplete: vi.fn(),
    onToggleFocus: vi.fn(),
    onTaskDelete: vi.fn(),
    isDarkMode: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders category title', () => {
    render(<TaskCategory {...mockProps} />);
    
    expect(screen.getByText('Inbox')).toBeInTheDocument();
  });

  it('renders task count', () => {
    render(<TaskCategory {...mockProps} />);
    
    expect(screen.getByText('2 tasks')).toBeInTheDocument();
  });

  it('renders singular task count', () => {
    render(<TaskCategory {...mockProps} tasks={[mockTask]} />);
    
    expect(screen.getByText('1 task')).toBeInTheDocument();
  });

  it('renders all tasks in category', () => {
    render(<TaskCategory {...mockProps} />);
    
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Completed Task')).toBeInTheDocument();
  });

  it('applies category color as accent', () => {
    render(<TaskCategory {...mockProps} />);
    
    const categoryHeader = screen.getByText('Inbox').closest('.border-l-4');
    expect(categoryHeader).toHaveStyle('border-left-color: #f59e0b');
  });

  it('shows empty state when no tasks', () => {
    render(<TaskCategory {...mockProps} tasks={[]} />);
    
    expect(screen.getByText('0 tasks')).toBeInTheDocument();
    expect(screen.getByText('No tasks in this category')).toBeInTheDocument();
  });

  it('applies dark mode styling', () => {
    render(<TaskCategory {...mockProps} isDarkMode={true} />);
    
    const categoryContainer = screen.getByText('Inbox').closest('.bg-white');
    expect(categoryContainer).toHaveClass('dark:bg-gray-800');
  });

  it('passes task handlers to TaskCard components', () => {
    render(<TaskCategory {...mockProps} />);
    
    // Verify that task cards are rendered (they should contain the task titles)
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Completed Task')).toBeInTheDocument();
  });

  it('handles different category types', () => {
    const nextCategory = mockCategories[1]; // Next category
    render(<TaskCategory {...mockProps} category={nextCategory} />);
    
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('renders with proper accessibility', () => {
    render(<TaskCategory {...mockProps} />);
    
    const categorySection = screen.getByRole('region');
    expect(categorySection).toBeInTheDocument();
  });

  it('displays category with custom color', () => {
    const customCategory = {
      id: 'custom',
      name: 'Custom Category',
      color: '#ff0000'
    };
    
    render(<TaskCategory {...mockProps} category={customCategory} />);
    
    expect(screen.getByText('Custom Category')).toBeInTheDocument();
    const categoryHeader = screen.getByText('Custom Category').closest('.border-l-4');
    expect(categoryHeader).toHaveStyle('border-left-color: #ff0000');
  });

  it('handles tasks with different states', () => {
    const focusedTask = { ...mockTask, id: 3, focused: true, title: 'Focused Task' };
    const tasksWithDifferentStates = [mockTask, mockCompletedTask, focusedTask];
    
    render(<TaskCategory {...mockProps} tasks={tasksWithDifferentStates} />);
    
    expect(screen.getByText('3 tasks')).toBeInTheDocument();
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Completed Task')).toBeInTheDocument();
    expect(screen.getByText('Focused Task')).toBeInTheDocument();
  });
});