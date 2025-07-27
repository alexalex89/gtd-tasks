import React from 'react';
import TaskCard from './TaskCard';

function TaskCategory({ category, tasks, onTaskEdit, onTaskDelete, onTaskComplete, onToggleFocus, isDarkMode }) {
  const sortTasks = (tasks) => {
    return tasks.sort((a, b) => {
      // First: focused tasks first
      if (a.focused && !b.focused) return -1;
      if (!a.focused && b.focused) return 1;
      
      // Second: priority descending (high=3, medium=2, low=1)
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority] || 0;
      const bPriority = priorityOrder[b.priority] || 0;
      if (aPriority !== bPriority) return bPriority - aPriority;
      
      // Third: due date ascending (earlier due dates first)
      const aDueDate = a.due_date ? new Date(a.due_date) : null;
      const bDueDate = b.due_date ? new Date(b.due_date) : null;
      if (aDueDate && bDueDate) {
        if (aDueDate.getTime() !== bDueDate.getTime()) {
          return aDueDate - bDueDate;
        }
      } else if (aDueDate && !bDueDate) {
        return -1; // Tasks with due dates come before tasks without
      } else if (!aDueDate && bDueDate) {
        return 1; // Tasks without due dates come after tasks with due dates
      }
      
      // Fourth: age ascending (older tasks first)
      const aDate = new Date(a.created_at || a.updated_at);
      const bDate = new Date(b.created_at || b.updated_at);
      return aDate - bDate;
    });
  };

  const activeTasks = sortTasks(tasks.filter(task => !task.completed));
  
  // Filter completed tasks to show only those completed within the last 24 hours
  const getRecentCompletedTasks = (tasks) => {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    return tasks
      .filter(task => {
        if (!task.completed) return false;
        
        // Use updated_at as the completion time
        const completedAt = task.updated_at ? new Date(task.updated_at) : null;
        return completedAt && completedAt >= twentyFourHoursAgo;
      })
      .slice(0, 3); // Limit to 3 tasks maximum
  };
  
  const completedTasks = sortTasks(getRecentCompletedTasks(tasks));
  
  return (
    <div className={`rounded-xl shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
      <div 
        className={`px-5 py-4 border-b flex justify-between items-center ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'}`}
        style={{ borderTopColor: category.color, borderTopWidth: '4px' }}
      >
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{category.name}</h3>
        <span 
          className="text-white px-2 py-1 rounded-full text-sm font-medium min-w-[20px] text-center"
          style={{ backgroundColor: category.color }}
        >
          {tasks.length}
        </span>
      </div>
      
      <div className="min-h-[200px] p-4">
        {activeTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onTaskEdit}
            onDelete={onTaskDelete}
            onComplete={onTaskComplete}
            onToggleFocus={onToggleFocus}
            isDarkMode={isDarkMode}
          />
        ))}
        
        {completedTasks.length > 0 && (
          <div className={`mt-6 pt-4 border-t ${isDarkMode ? 'border-slate-600' : 'border-slate-200'}`}>
            <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Recently Completed ({completedTasks.length}/3)
            </h4>
            {completedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onTaskEdit}
                onDelete={onTaskDelete}
                onComplete={onTaskComplete}
                onToggleFocus={onToggleFocus}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskCategory;