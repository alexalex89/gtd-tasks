import React, { useRef } from 'react';

function TaskCard({ task, onEdit, onDelete, onComplete, onToggleFocus, isDarkMode }) {
  const touchStartPos = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getTimeDisplayName = (timeId) => {
    const timeMapping = {
      '5min': '5 min',
      '10min': '10 min',
      '15min': '15 min',
      '30min': '30 min',
      '45min': '45 min',
      '1hour': '1 hour',
      '2hours': '2 hours',
      '3hours': '3 hours',
      '4hours': '4 hours',
      '6hours': '6 hours',
      '8hours': '8 hours'
    };
    return timeMapping[timeId] || timeId;
  };

  const getEnergyDisplayName = (energyId) => {
    const energyMapping = {
      'low': 'Low',
      'medium': 'Med',
      'high': 'High'
    };
    return energyMapping[energyId] || energyId;
  };


  const handleTouchStart = (e) => {
    // Store initial touch position
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    hasMoved.current = false;
  };

  const handleTouchMove = (e) => {
    // Calculate movement distance
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartPos.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartPos.current.y);
    const moveThreshold = 15; // pixels
    
    // If user moved more than threshold, consider it scrolling
    if (deltaX > moveThreshold || deltaY > moveThreshold) {
      hasMoved.current = true;
    }
  };

  const handleCardClick = (e) => {
    // Don't trigger edit if clicking on checkbox or action buttons
    if (e.target.closest('input[type="checkbox"], .task-actions, .star-button') || e.target.type === 'checkbox') {
      return;
    }
    
    // On mobile touch, only block if user clearly scrolled
    if (e.type === 'touchend' && hasMoved.current) {
      return;
    }
    
    onEdit(task);
  };

  return (
    <div
      className={`${isDarkMode ? 'task-card-dark' : 'task-card'} group ${task.completed ? 'task-card-completed' : ''}`}
      onClick={handleCardClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={(e) => {
        // Don't prevent default on interactive elements
        if (e.target.closest('input[type="checkbox"], .task-actions, .star-button, button')) {
          return;
        }
        e.preventDefault();
        handleCardClick(e);
      }}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2 flex-1">
          <input
            type="checkbox"
            checked={task.completed || false}
            onChange={(e) => {
              e.stopPropagation();
              onComplete(task);
            }}
            className="w-5 h-5 md:w-4 md:h-4 cursor-pointer task-checkbox"
          />
          <h4 
            className={`font-semibold flex-1 ${task.completed ? (isDarkMode ? 'text-slate-400 line-through' : 'text-slate-500 line-through') : (isDarkMode ? 'text-slate-200' : 'text-slate-800')}`}
          >
            {task.title}
          </h4>
        </div>
        <div className="task-actions flex gap-2 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFocus(task.id, !task.focused);
            }}
            className={`star-button text-base p-1 rounded transition-colors duration-200 ${
              task.focused 
                ? `text-yellow-500 ${isDarkMode ? 'hover:bg-yellow-900' : 'hover:bg-yellow-100'}` 
                : `${isDarkMode ? 'text-slate-500 hover:bg-slate-700' : 'text-slate-400 hover:bg-slate-100'} hover:text-yellow-400 opacity-100 md:opacity-0 md:group-hover:opacity-100`
            }`}
            title={task.focused ? 'Remove from focus' : 'Add to focus'}
          >
            {task.focused ? '⭐' : '☆'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className={`text-base p-1 rounded transition-colors duration-200 opacity-100 md:opacity-0 md:group-hover:opacity-100 ${isDarkMode ? 'hover:bg-red-900' : 'hover:bg-red-100'}`}
            title="Delete task"
          >
            🗑️
          </button>
        </div>
      </div>
      
      {(task.priority || task.time_estimate || task.energy_level) && (
        <div className="flex gap-2 mb-2">
          {task.priority && (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
              <span className={`w-2 h-2 rounded-full mr-1 ${
                task.priority === 'high' ? 'bg-red-500' :
                task.priority === 'medium' ? 'bg-yellow-500' :
                'bg-green-500'
              }`}></span>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
          )}
          {task.time_estimate && (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>
              ⏱️ {getTimeDisplayName(task.time_estimate)}
            </span>
          )}
          {task.energy_level && (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              task.energy_level === 'high' ? (isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800') :
              task.energy_level === 'medium' ? (isDarkMode ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800') :
              (isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800')
            }`}>
              ⚡ {getEnergyDisplayName(task.energy_level)}
            </span>
          )}
        </div>
      )}
      
      {task.description && (
        <p 
          className={`text-sm mb-2 leading-relaxed ${task.completed ? (isDarkMode ? 'text-slate-500 line-through' : 'text-slate-400 line-through') : (isDarkMode ? 'text-slate-400' : 'text-slate-600')}`}
        >
          {task.description}
        </p>
      )}
      
      {task.due_date && (
        <div className={`text-sm font-medium ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
          📅 {formatDate(task.due_date)}
        </div>
      )}
    </div>
  );
}

export default TaskCard;