import React from 'react';

function Sidebar({ categories, activeCategory, onCategorySelect, taskCounts, onAddTask, focusCount, completedTodayCount, isOpen, onClose, isDarkMode, onToggleDarkMode }) {
  const menuItems = [
    { id: 'all', name: 'All Tasks', icon: '📋', color: '#6366f1' },
    { id: 'focused', name: 'Focus', icon: '⭐', color: '#eab308' },
    ...categories.map(cat => ({
      ...cat,
      icon: getIconForCategory(cat.id)
    }))
  ];

  function getIconForCategory(categoryId) {
    const icons = {
      inbox: '📥',
      next: '⚡',
      waiting: '⏳',
      scheduled: '📅',
      someday: '🔮'
    };
    return icons[categoryId] || '📝';
  }

  const getTotalTasks = () => {
    return Object.values(taskCounts).reduce((sum, count) => sum + count, 0);
  };


  return (
    <div className={`
      fixed inset-y-0 left-0 z-40
      w-80 border-r flex flex-col h-screen
      transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}
    `}>
      <div className={`px-6 py-6 border-b flex items-center ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
        <button 
          className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 text-white text-lg font-medium cursor-pointer transition-all duration-200 flex items-center justify-center hover:scale-110 hover:shadow-lg"
          onClick={onAddTask}
          title="Add new task"
        >
          +
        </button>
        
        <h2 className={`text-xl font-bold flex-1 text-center ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>GTD Manager</h2>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        {menuItems.map(item => (
          item.id === 'all' ? (
            <button
              key={item.id}
              className={`w-full flex items-center px-5 py-3 text-left cursor-pointer transition-all duration-200 text-sm relative ${
                activeCategory === item.id 
                  ? `${isDarkMode ? 'bg-indigo-900 text-indigo-400' : 'bg-indigo-50 text-indigo-600'} font-semibold before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-indigo-600` 
                  : `${isDarkMode ? 'text-slate-300 hover:bg-slate-700 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-700'}`
              }`}
              onClick={() => onCategorySelect(item.id)}
            >
              <span className="text-xl mr-3 w-6 text-center">{item.icon}</span>
              <span className="flex-1">{item.name}</span>
              <span className={`px-2 py-1 rounded-xl text-xs font-medium min-w-[20px] text-center ${
                activeCategory === item.id
                  ? 'bg-indigo-600 text-white'
                  : `${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'}`
              }`}>
                {getTotalTasks()}
              </span>
            </button>
          ) : item.id === 'focused' ? (
            <button
              key={item.id}
              className={`w-full flex items-center px-5 py-3 text-left cursor-pointer transition-all duration-200 text-sm relative ${
                activeCategory === item.id 
                  ? `${isDarkMode ? 'bg-yellow-900 text-yellow-400' : 'bg-yellow-50 text-yellow-600'} font-semibold before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-yellow-600` 
                  : `${isDarkMode ? 'text-slate-300 hover:bg-slate-700 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-700'}`
              }`}
              onClick={() => onCategorySelect(item.id)}
            >
              <span className="text-xl mr-3 w-6 text-center">{item.icon}</span>
              <span className="flex-1">{item.name}</span>
              <span className={`px-2 py-1 rounded-xl text-xs font-medium min-w-[20px] text-center ${
                activeCategory === item.id
                  ? 'bg-yellow-600 text-white'
                  : `${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'}`
              }`}>
                {focusCount || 0}
              </span>
            </button>
          ) : (
            <button
              key={item.id}
              className={`w-full flex items-center px-5 py-3 text-left cursor-pointer transition-all duration-200 text-sm relative ${
                activeCategory === item.id 
                  ? `${isDarkMode ? 'bg-slate-700' : 'bg-indigo-50'} font-semibold before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1` 
                  : `${isDarkMode ? 'text-slate-300 hover:bg-slate-700 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-700'}`
              }`}
              onClick={() => onCategorySelect(item.id)}
              style={{
                color: activeCategory === item.id ? item.color : undefined,
                '--tw-gradient-from': item.color,
              }}
            >
              <span className="text-xl mr-3 w-6 text-center">{item.icon}</span>
              <span className="flex-1">{item.name}</span>
              <span 
                className={`px-2 py-1 rounded-xl text-xs font-medium min-w-[20px] text-center text-white`}
                style={{ 
                  backgroundColor: activeCategory === item.id ? item.color : (isDarkMode ? '#334155' : '#e2e8f0'),
                  color: activeCategory === item.id ? 'white' : (isDarkMode ? '#cbd5e1' : '#64748b')
                }}
              >
                {taskCounts[item.id] || 0}
              </span>
            </button>
          )
        ))}
      </nav>

      <div className={`border-t p-5 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Total Tasks</span>
            <span className={`text-sm font-semibold px-2 py-1 rounded-md ${isDarkMode ? 'text-slate-200 bg-slate-700' : 'text-slate-800 bg-slate-100'}`}>
              {getTotalTasks()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Completed Today</span>
            <span className={`text-sm font-semibold px-2 py-1 rounded-md ${isDarkMode ? 'text-slate-200 bg-slate-700' : 'text-slate-800 bg-slate-100'}`}>
              {completedTodayCount || 0}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}">
            <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Dark Mode</span>
            <button
              onClick={onToggleDarkMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-200'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;