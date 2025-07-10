import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const GTD_CATEGORIES = [
  { id: 'inbox', name: 'Inbox' },
  { id: 'next', name: 'Next' },
  { id: 'waiting', name: 'Waiting' },
  { id: 'scheduled', name: 'Scheduled' },
  { id: 'someday', name: 'Someday' }
];

const PRIORITIES = [
  { id: 'low', name: 'Low' },
  { id: 'medium', name: 'Medium' },
  { id: 'high', name: 'High' }
];

const TIME_ESTIMATES = [
  { id: '5min', name: '5 min' },
  { id: '10min', name: '10 min' },
  { id: '15min', name: '15 min' },
  { id: '30min', name: '30 min' },
  { id: '45min', name: '45 min' },
  { id: '1hour', name: '1 hour' },
  { id: '2hours', name: '2 hours' },
  { id: '3hours', name: '3 hours' },
  { id: '4hours', name: '4 hours' },
  { id: '6hours', name: '6 hours' },
  { id: '8hours', name: '8 hours' }
];

const ENERGY_LEVELS = [
  { id: 'low', name: 'Low' },
  { id: 'medium', name: 'Medium' },
  { id: 'high', name: 'High' }
];

function TaskForm({ task, onSubmit, onCancel, defaultCategory = 'inbox', isDarkMode }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: defaultCategory,
    priority: 'medium',
    due_date: null,
    focused: false,
    time_estimate: '',
    energy_level: ''
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        category: task.category || 'inbox',
        priority: task.priority || 'medium',
        due_date: task.due_date ? new Date(task.due_date) : null,
        focused: task.focused || false,
        time_estimate: task.time_estimate || '',
        energy_level: task.energy_level || ''
      });
    } else {
      // For new tasks, set the default category
      setFormData(prev => ({
        ...prev,
        category: defaultCategory
      }));
    }
  }, [task, defaultCategory]);

  // Lock body scroll when modal is open
  useEffect(() => {
    // Store original overflow value
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    
    // Lock scroll
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    
    // Cleanup function to restore scroll
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const submitData = {
      ...formData,
      due_date: formData.due_date ? 
        `${formData.due_date.getFullYear()}-${String(formData.due_date.getMonth() + 1).padStart(2, '0')}-${String(formData.due_date.getDate()).padStart(2, '0')}` : 
        null
    };

    onSubmit(submitData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-5"
      onClick={(e) => {
        // Close modal when clicking on overlay
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
      onTouchStart={(e) => {
        // Prevent scroll on overlay
        if (e.target === e.currentTarget) {
          e.preventDefault();
        }
      }}
      onTouchMove={(e) => {
        // Prevent scroll on overlay
        if (e.target === e.currentTarget) {
          e.preventDefault();
        }
      }}
    >
      <div 
        className={`rounded-xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={`text-2xl font-semibold mb-6 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
          {task ? 'Edit Task' : 'Add New Task'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className={`block mb-2 font-medium text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter task title"
              className={`w-full px-3 py-3 border rounded-lg text-base transition-colors duration-200 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'}`}
              required
            />
          </div>

          <div>
            <label htmlFor="description" className={`block mb-2 font-medium text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Enter task description"
              rows="3"
              className={`w-full px-3 py-3 border rounded-lg text-base transition-colors duration-200 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 resize-none ${isDarkMode ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'}`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className={`block mb-2 font-medium text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Category
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className={`w-full px-3 py-3 border rounded-lg text-base transition-colors duration-200 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-900'}`}
              >
                {GTD_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="priority" className={`block mb-2 font-medium text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Priority
              </label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                className={`w-full px-3 py-3 border rounded-lg text-base transition-colors duration-200 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-900'}`}
              >
                {PRIORITIES.map(priority => (
                  <option key={priority.id} value={priority.id}>
                    {priority.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="time_estimate" className={`block mb-2 font-medium text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Time Estimate
              </label>
              <select
                id="time_estimate"
                value={formData.time_estimate}
                onChange={(e) => handleChange('time_estimate', e.target.value)}
                className={`w-full px-3 py-3 border rounded-lg text-base transition-colors duration-200 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-900'}`}
              >
                <option value="">Select time estimate</option>
                {TIME_ESTIMATES.map(time => (
                  <option key={time.id} value={time.id}>
                    {time.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="energy_level" className={`block mb-2 font-medium text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Energy Level
              </label>
              <select
                id="energy_level"
                value={formData.energy_level}
                onChange={(e) => handleChange('energy_level', e.target.value)}
                className={`w-full px-3 py-3 border rounded-lg text-base transition-colors duration-200 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-900'}`}
              >
                <option value="">Select energy level</option>
                {ENERGY_LEVELS.map(energy => (
                  <option key={energy.id} value={energy.id}>
                    {energy.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={`block mb-2 font-medium text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              Due Date
            </label>
            <DatePicker
              selected={formData.due_date}
              onChange={(date) => handleChange('due_date', date)}
              dateFormat="MMM dd, yyyy"
              placeholderText="Select due date"
              className={`w-full px-3 py-3 border rounded-lg text-base transition-colors duration-200 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'}`}
              isClearable
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.focused}
                onChange={(e) => handleChange('focused', e.target.checked)}
                className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
              />
              <span className={`font-medium text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                ⭐ Add to focus
              </span>
            </label>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button 
              type="button" 
              onClick={onCancel} 
              className="btn-secondary"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
            >
              {task ? 'Update Task' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskForm;