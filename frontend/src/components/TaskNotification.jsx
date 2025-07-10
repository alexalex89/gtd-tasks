import React, { useState, useEffect } from 'react';

function TaskNotification({ notification, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [progressStarted, setProgressStarted] = useState(false);

  useEffect(() => {
    if (notification) {
      // Start visible
      setIsVisible(true);
      setIsLeaving(false);
      
      // Start progress animation after a brief delay
      const progressTimer = setTimeout(() => {
        setProgressStarted(true);
      }, 100);
      
      // Auto-hide after 4 seconds
      const hideTimer = setTimeout(() => {
        setIsLeaving(true);
        // Complete removal after animation
        setTimeout(() => {
          onClose();
        }, 300);
      }, 4000);

      return () => {
        clearTimeout(progressTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [notification, onClose]);

  if (!notification) return null;

  const getNotificationIcon = (action) => {
    switch (action) {
      case 'create': return '✨';
      case 'update': return '📝';
      case 'delete': return '🗑️';
      default: return '📋';
    }
  };

  const getNotificationMessage = (action, task) => {
    switch (action) {
      case 'create': return `New task: "${task.title}"`;
      case 'update': return `Task updated: "${task.title}"`;
      case 'delete': return `Task deleted: "${task.title}"`;
      default: return `Task changed: "${task.title}"`;
    }
  };

  const getNotificationColor = (action) => {
    switch (action) {
      case 'create': return 'bg-green-500';
      case 'update': return 'bg-blue-500';
      case 'delete': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={`
      fixed top-4 right-4 z-50 
      max-w-sm min-w-[300px] 
      bg-white rounded-lg shadow-lg border border-gray-200
      transform transition-all duration-300 ease-in-out
      ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
    `}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center text-white
            ${getNotificationColor(notification.action)}
          `}>
            {getNotificationIcon(notification.action)}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              {getNotificationMessage(notification.action, notification.task)}
            </p>
            {notification.task?.category && (
              <p className="text-xs text-gray-500 mt-1">
                Category: {notification.task.category}
              </p>
            )}
          </div>
          
          <button
            onClick={() => {
              setIsLeaving(true);
              setTimeout(onClose, 300);
            }}
            className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            ×
          </button>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="h-1 bg-gray-100 rounded-b-lg overflow-hidden">
        <div 
          className={`h-full ${getNotificationColor(notification.action)} transition-all duration-[3900ms] ease-linear`}
          style={{
            width: progressStarted ? '0%' : '100%'
          }}
        />
      </div>
    </div>
  );
}

export default TaskNotification;