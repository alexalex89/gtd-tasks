import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../test/test-utils';
import TaskForm from '../TaskForm';
import { mockTask, mockCategories } from '../../test/test-utils';

describe('TaskForm', () => {
  const mockProps = {
    task: null,
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
    defaultCategory: 'inbox',
    isDarkMode: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = '';
  });

  it('renders form', () => {
    render(<TaskForm {...mockProps} />);
    
    expect(screen.getByText('Add New Task')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  it('shows edit mode when task is provided', () => {
    render(<TaskForm {...mockProps} task={mockTask} />);
    
    expect(screen.getByText('Edit Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test task description')).toBeInTheDocument();
  });

  it('renders all form fields', () => {
    render(<TaskForm {...mockProps} />);
    
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Priority')).toBeInTheDocument();
    expect(screen.getByLabelText('Due Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Time Estimate')).toBeInTheDocument();
    expect(screen.getByLabelText('Energy Level')).toBeInTheDocument();
  });

  it('renders all categories in dropdown', () => {
    render(<TaskForm {...mockProps} />);
    
    const categorySelect = screen.getByLabelText('Category');
    mockCategories.forEach(category => {
      expect(screen.getByText(category.name)).toBeInTheDocument();
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<TaskForm {...mockProps} />);
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(mockProps.onCancel).toHaveBeenCalled();
  });

  it('calls onCancel when X button is clicked', () => {
    render(<TaskForm {...mockProps} />);
    
    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);
    
    expect(mockProps.onCancel).toHaveBeenCalled();
  });

  it('calls onSubmit with form data when save button is clicked', async () => {
    render(<TaskForm {...mockProps} />);
    
    const titleInput = screen.getByLabelText('Title');
    const descriptionInput = screen.getByLabelText('Description');
    const saveButton = screen.getByText('Save Task');
    
    fireEvent.change(titleInput, { target: { value: 'New Task Title' } });
    fireEvent.change(descriptionInput, { target: { value: 'New task description' } });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockProps.onSubmit).toHaveBeenCalledWith(expect.objectContaining({
        title: 'New Task Title',
        description: 'New task description',
        category: 'inbox',
        priority: 'medium',
      }));
    });
  });

  it('prevents form submission when title is empty', async () => {
    render(<TaskForm {...mockProps} />);
    
    const saveButton = screen.getByText('Save Task');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockProps.onSubmit).not.toHaveBeenCalled();
    });
  });

  it('applies dark mode styling', () => {
    render(<TaskForm {...mockProps} isDarkMode={true} />);
    
    const modal = screen.getByRole('dialog');
    expect(modal).toHaveClass('bg-gray-800');
  });

  it('locks body scroll when open', () => {
    render(<TaskForm {...mockProps} />);
    
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body scroll when unmounted', () => {
    const { unmount } = render(<TaskForm {...mockProps} />);
    
    expect(document.body.style.overflow).toBe('');
    
    unmount();
    
    expect(document.body.style.overflow).toBe('');
  });

  it('prevents background scroll on touch', () => {
    render(<TaskForm {...mockProps} />);
    
    const modal = screen.getByRole('dialog');
    const touchEvent = new TouchEvent('touchmove', { cancelable: true });
    
    fireEvent(modal, touchEvent);
    
    expect(touchEvent.defaultPrevented).toBe(true);
  });

  it('updates form fields when task prop changes', () => {
    const { rerender } = render(<TaskForm {...mockProps} />);
    
    expect(screen.getByLabelText('Title')).toHaveValue('');
    
    rerender(<TaskForm {...mockProps} task={mockTask} />);
    
    expect(screen.getByLabelText('Title')).toHaveValue('Test Task');
    expect(screen.getByLabelText('Description')).toHaveValue('Test task description');
  });

  it('resets form when task changes from edit to new', () => {
    const { rerender } = render(<TaskForm {...mockProps} task={mockTask} />);
    
    expect(screen.getByLabelText('Title')).toHaveValue('Test Task');
    
    rerender(<TaskForm {...mockProps} task={null} />);
    
    expect(screen.getByLabelText('Title')).toHaveValue('');
  });

  it('handles priority selection', () => {
    render(<TaskForm {...mockProps} />);
    
    const prioritySelect = screen.getByLabelText('Priority');
    fireEvent.change(prioritySelect, { target: { value: 'high' } });
    
    expect(prioritySelect.value).toBe('high');
  });

  it('handles energy level selection', () => {
    render(<TaskForm {...mockProps} />);
    
    const energySelect = screen.getByLabelText('Energy Level');
    fireEvent.change(energySelect, { target: { value: 'high' } });
    
    expect(energySelect.value).toBe('high');
  });
});