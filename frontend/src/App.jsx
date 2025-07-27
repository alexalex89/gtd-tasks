import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import TaskCategory from './components/TaskCategory';
import TaskForm from './components/TaskForm';
import Sidebar from './components/Sidebar';
import TaskNotification from './components/TaskNotification';
import { getApiUrl } from './utils/api';
import { wsManager } from './utils/websocket';
import { refreshApp } from './utils/pwa';

const DEBUG = import.meta.env.DEBUG === 'true' || import.meta.env.NODE_ENV === 'development';

const GTD_CATEGORIES = [
  { id: 'inbox', name: 'Inbox', color: '#f59e0b' },
  { id: 'next', name: 'Next', color: '#10b981' },
  { id: 'waiting', name: 'Waiting', color: '#f97316' },
  { id: 'scheduled', name: 'Scheduled', color: '#3b82f6' },
  { id: 'someday', name: 'Someday', color: '#8b5cf6' }
];

function GTDApp() {
  const [tasks, setTasks] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const { section } = useParams();
  const navigate = useNavigate();
  const activeCategory = section || 'all';

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    if (DEBUG) {
      console.log('🐛 Debug mode enabled in frontend');
      console.log('Environment variables:', {
        NODE_ENV: import.meta.env.NODE_ENV,
        DEBUG: import.meta.env.DEBUG,
        API_URL: import.meta.env.VITE_API_URL
      });
    }
    
    // Initial fetch
    fetchTasks();
    
    // Set up periodic check for overdue tasks (every 5 minutes)
    const periodicCheck = setInterval(() => {
      if (DEBUG) console.log('⏰ Periodic check: fetching tasks to mark overdue tasks as focused');
      fetchTasks();
    }, 5 * 60 * 1000); // 5 minutes
    
    // Set up WebSocket connection
    const removeListener = wsManager.addListener({
      onConnect: () => {
        setWsConnected(true);
        if (DEBUG) console.log('🔌 WebSocket connected - real-time updates enabled');
      },
      onDisconnect: () => {
        setWsConnected(false);
        if (DEBUG) console.log('🔌 WebSocket disconnected - real-time updates disabled');
      },
      onMessage: (data) => {
        if (data.type === 'task_update') {
          if (DEBUG) console.log('🔄 Received task update:', data.action, data.task);
          
          // Show notification for the update
          setNotification({
            action: data.action,
            task: data.task,
            timestamp: data.timestamp
          });
          
          // Refresh tasks when we receive updates
          fetchTasks();
        }
      }
    });
    
    // Connect to WebSocket
    wsManager.connect();
    
    return () => {
      clearInterval(periodicCheck);
      removeListener();
      wsManager.disconnect();
    };
  }, []);


  const fetchTasks = async () => {
    try {
      if (DEBUG) console.log('🔄 Fetching tasks...');
      const apiUrl = getApiUrl('/api/tasks');
      if (DEBUG) console.log('📡 API URL:', apiUrl);
      const response = await fetch(apiUrl);
      const allTasks = await response.json();
      if (DEBUG) console.log('📋 Fetched tasks:', allTasks.length, 'tasks');
      
      const tasksByCategory = {};
      GTD_CATEGORIES.forEach(category => {
        tasksByCategory[category.id] = allTasks.filter(task => task.category === category.id);
      });
      
      // Add focused tasks section
      tasksByCategory['focused'] = allTasks.filter(task => task.focused);
      
      setTasks(tasksByCategory);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleTaskSubmit = async (taskData) => {
    try {
      const url = editingTask ? `/api/tasks/${editingTask.id}` : '/api/tasks';
      const method = editingTask ? 'PUT' : 'POST';
      
      const response = await fetch(getApiUrl(url), {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });
      
      if (response.ok) {
        fetchTasks();
        setShowForm(false);
        setEditingTask(null);
      }
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleTaskEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleTaskDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const response = await fetch(getApiUrl(`/api/tasks/${taskId}`), {
          method: 'DELETE',
        });
        
        if (response.ok) {
          fetchTasks();
        }
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleTaskComplete = async (task) => {
    try {
      const response = await fetch(getApiUrl(`/api/tasks/${task.id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...task,
          completed: !task.completed
        }),
      });
      
      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleToggleFocus = async (taskId, focused) => {
    try {
      const response = await fetch(getApiUrl(`/api/tasks/${taskId}/focus`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ focused }),
      });
      
      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error updating task focus:', error);
    }
  };




  const getFilteredCategories = () => {
    if (activeCategory === 'all') {
      return GTD_CATEGORIES;
    }
    if (activeCategory === 'focused') {
      return [{ id: 'focused', name: 'Focus', color: '#eab308' }];
    }
    return GTD_CATEGORIES.filter(category => category.id === activeCategory);
  };

  const getTotalTaskCount = (categoryId) => {
    return tasks[categoryId]?.length || 0;
  };

  const getCompletedTodayCount = () => {
    const today = new Date().toISOString().split('T')[0];
    const allTasks = Object.values(tasks).flat();
    return allTasks.filter(task => 
      task.completed && 
      task.updated_at && 
      task.updated_at.split('T')[0] === today
    ).length;
  };

  return (
    <>
      <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className="flex min-h-screen relative">
        {/* Hamburger button for both mobile and desktop */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`fixed top-6 left-4 z-50 p-2 rounded-lg shadow-lg border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
          aria-label="Toggle menu"
        >
          <div className="w-6 h-6 flex flex-col justify-center items-center">
            <span className={`block w-5 h-0.5 transition-all duration-300 ${isDarkMode ? 'bg-slate-300' : 'bg-slate-600'} ${isSidebarOpen ? 'rotate-45 translate-y-1' : ''}`}></span>
            <span className={`block w-5 h-0.5 transition-all duration-300 mt-1 ${isDarkMode ? 'bg-slate-300' : 'bg-slate-600'} ${isSidebarOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-5 h-0.5 transition-all duration-300 mt-1 ${isDarkMode ? 'bg-slate-300' : 'bg-slate-600'} ${isSidebarOpen ? '-rotate-45 -translate-y-1' : ''}`}></span>
          </div>
        </button>

        {/* Refresh button - mobile only */}
        <button
          onClick={refreshApp}
          className={`fixed top-20 left-4 z-50 p-2 rounded-lg shadow-lg border transition-colors md:hidden ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
          aria-label="Refresh app"
          title="Refresh app"
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>🔄</span>
          </div>
        </button>

        {/* Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        <Sidebar 
          categories={GTD_CATEGORIES}
          activeCategory={activeCategory}
          onCategorySelect={(category) => {
            if (category === 'all') {
              navigate('/');
            } else {
              navigate(`/${category}`);
            }
            // Close sidebar on mobile after selection
            setIsSidebarOpen(false);
          }}
          taskCounts={GTD_CATEGORIES.reduce((acc, cat) => {
            acc[cat.id] = getTotalTaskCount(cat.id);
            return acc;
          }, {})}
          onAddTask={() => {
            setShowForm(true);
            setIsSidebarOpen(false);
          }}
          focusCount={tasks['focused']?.length || 0}
          completedTodayCount={getCompletedTodayCount()}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />
        
        <div className="flex-1 p-3 md:p-5 pt-16 overflow-x-auto">
          <header className="flex flex-row justify-between items-center mb-6 md:mb-8 pb-4 md:pb-5 border-b-2 border-slate-200 gap-4">
            <div className="flex-1">
              <h1 className={`text-2xl md:text-4xl font-bold ml-16 md:ml-16 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                {activeCategory === 'all' 
                  ? 'All Tasks' 
                  : activeCategory === 'focused' 
                    ? 'Focus' 
                    : GTD_CATEGORIES.find(cat => cat.id === activeCategory)?.name || 'Tasks'
                }
              </h1>
            </div>
            <button 
              className="btn-primary"
              onClick={() => setShowForm(true)}
            >
              + Add Task
            </button>
          </header>

          <div className={`grid gap-4 md:gap-5 max-w-screen-xl mx-auto ${
            activeCategory !== 'all' 
              ? 'grid-cols-1 max-w-2xl' 
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
          }`}>
            {getFilteredCategories().map(category => (
              <TaskCategory
                key={category.id}
                category={category}
                tasks={tasks[category.id] || []}
                onTaskEdit={handleTaskEdit}
                onTaskDelete={handleTaskDelete}
                onTaskComplete={handleTaskComplete}
                onToggleFocus={handleToggleFocus}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        </div>
        </div>
      </div>

      {showForm && (
        <TaskForm
          task={editingTask}
          onSubmit={handleTaskSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
          defaultCategory={
            // Only use section as default if it's a valid GTD category
            GTD_CATEGORIES.find(cat => cat.id === activeCategory) 
              ? activeCategory 
              : 'inbox'
          }
          isDarkMode={isDarkMode}
        />
      )}


      <TaskNotification
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GTDApp />} />
        <Route path="/:section" element={<GTDApp />} />
      </Routes>
    </Router>
  );
}

export default App;
