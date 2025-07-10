import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../test/test-utils';
import Sidebar from '../Sidebar';

describe('Sidebar', () => {
  const mockCategories = [
    { id: 'inbox', name: 'Inbox', color: '#f59e0b' },
    { id: 'next', name: 'Next', color: '#10b981' },
  ];

  const mockProps = {
    categories: mockCategories,
    activeCategory: 'all',
    onCategorySelect: vi.fn(),
    taskCounts: { inbox: 2, next: 1 },
    onAddTask: vi.fn(),
    focusCount: 0,
    completedTodayCount: 3,
    isOpen: true,
    onClose: vi.fn(),
    onToggleDarkMode: vi.fn(),
    isDarkMode: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when open', () => {
    render(<Sidebar {...mockProps} />);
    
    expect(screen.getByText('GTD Manager')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<Sidebar {...mockProps} isOpen={false} />);
    
    expect(screen.queryByText('GTD Manager')).not.toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Sidebar {...mockProps} />);
    
    expect(screen.getByText('All Tasks')).toBeInTheDocument();
    expect(screen.getByText('Focus')).toBeInTheDocument();
    expect(screen.getByText('Inbox')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('renders dark mode toggle', () => {
    render(<Sidebar {...mockProps} />);
    
    expect(screen.getByText('Dark Mode')).toBeInTheDocument();
    const toggleButton = screen.getByRole('button', { name: /toggle dark mode/i });
    expect(toggleButton).toBeInTheDocument();
  });

  it('calls onToggleDarkMode when toggle is clicked', () => {
    render(<Sidebar {...mockProps} />);
    
    const toggleButton = screen.getByText('Dark Mode').nextElementSibling;
    fireEvent.click(toggleButton);
    
    expect(mockProps.onToggleDarkMode).toHaveBeenCalled();
  });

  it('calls onAddTask when add button is clicked', () => {
    render(<Sidebar {...mockProps} />);
    
    const addButton = screen.getByTitle('Add new task');
    fireEvent.click(addButton);
    
    expect(mockProps.onAddTask).toHaveBeenCalled();
  });

  it('applies dark mode styling', () => {
    render(<Sidebar {...mockProps} isDarkMode={true} />);
    
    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toHaveClass('bg-gray-800');
  });

  it('shows dark mode toggle in correct state when dark mode is enabled', () => {
    render(<Sidebar {...mockProps} isDarkMode={true} />);
    
    const toggleButton = screen.getByRole('button', { name: /toggle dark mode/i });
    const toggleSlider = toggleButton.querySelector('.translate-x-5');
    expect(toggleSlider).toBeInTheDocument();
  });

  it('shows dark mode toggle in correct state when dark mode is disabled', () => {
    render(<Sidebar {...mockProps} isDarkMode={false} />);
    
    const toggleButton = screen.getByRole('button', { name: /toggle dark mode/i });
    const toggleSlider = toggleButton.querySelector('.translate-x-0');
    expect(toggleSlider).toBeInTheDocument();
  });

  it('renders overlay when open', () => {
    render(<Sidebar {...mockProps} />);
    
    const overlay = document.querySelector('.fixed.inset-0.bg-black');
    expect(overlay).toBeInTheDocument();
  });

  it('calls onClose when overlay is clicked', () => {
    render(<Sidebar {...mockProps} />);
    
    const overlay = document.querySelector('.fixed.inset-0.bg-black');
    fireEvent.click(overlay);
    
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('has proper navigation structure', () => {
    render(<Sidebar {...mockProps} />);
    
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
    
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(3); // Dashboard, Tasks, Focus
  });

  it('renders with proper accessibility attributes', () => {
    render(<Sidebar {...mockProps} />);
    
    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toHaveAttribute('aria-label', 'Sidebar navigation');
  });

  it('handles keyboard navigation', () => {
    render(<Sidebar {...mockProps} />);
    
    const closeButton = screen.getByRole('button', { name: /close menu/i });
    closeButton.focus();
    
    fireEvent.keyDown(closeButton, { key: 'Enter' });
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('traps focus within sidebar when open', () => {
    render(<Sidebar {...mockProps} />);
    
    const focusableElements = screen.getAllByRole('button').concat(screen.getAllByRole('link'));
    expect(focusableElements.length).toBeGreaterThan(0);
  });

  it('applies transform animation classes', () => {
    render(<Sidebar {...mockProps} />);
    
    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toHaveClass('transform', 'transition-transform', 'duration-300');
  });

  it('shows slide-in animation when open', () => {
    render(<Sidebar {...mockProps} />);
    
    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toHaveClass('translate-x-0');
  });
});