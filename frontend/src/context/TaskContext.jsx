import { createContext, useContext, useState, useCallback } from 'react';
import { tasksAPI, aiAPI } from '../services/api';
import toast from 'react-hot-toast';

const TaskContext = createContext(null);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks]       = useState([]);
  const [stats, setStats]       = useState({});
  const [loading, setLoading]   = useState(false);
  const [filters, setFilters]   = useState({
    status: '', priority: '', category: '', search: ''
  });

  const fetchTasks = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await tasksAPI.getAll({ ...filters, ...params });
      setTasks(data.tasks);
      setStats(data.stats);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createTask = async (taskData) => {
    const { data } = await tasksAPI.create(taskData);
    setTasks(prev => [data.task, ...prev]);
    setStats(prev => ({
      ...prev,
      total: (prev.total || 0) + 1,
      pending: (prev.pending || 0) + 1
    }));
    toast.success('Task created! ✅');
    return data.task;
  };

  const updateTask = async (id, updates) => {
    const { data } = await tasksAPI.update(id, updates);
    setTasks(prev => prev.map(t => t._id === id ? data.task : t));
    return data.task;
  };

  const deleteTask = async (id) => {
    await tasksAPI.delete(id);
    setTasks(prev => prev.filter(t => t._id !== id));
    setStats(prev => ({ ...prev, total: (prev.total || 1) - 1 }));
    toast.success('Task deleted');
  };

  const toggleTask = async (id) => {
    const { data } = await tasksAPI.toggle(id);
    setTasks(prev => prev.map(t => t._id === id ? data.task : t));
    setStats(prev => ({
      ...prev,
      completed: data.task.isCompleted
        ? (prev.completed || 0) + 1
        : (prev.completed || 1) - 1,
      pending: data.task.isCompleted
        ? (prev.pending || 1) - 1
        : (prev.pending || 0) + 1
    }));
    toast.success(data.message);
  };

  const pinTask = async (id) => {
    const { data } = await tasksAPI.pin(id);
    setTasks(prev => prev.map(t => t._id === id ? data.task : t));
  };

  const analyzeWithAI = async (title, description) => {
    const { data } = await aiAPI.analyze({ title, description });
    return data.analysis;
  };

  const getMoodSuggestions = async (mood) => {
    const { data } = await aiAPI.moodSuggestions(mood);
    return data.suggestions;
  };

  return (
    <TaskContext.Provider value={{
      tasks, stats, loading, filters,
      setFilters, fetchTasks, createTask,
      updateTask, deleteTask, toggleTask,
      pinTask, analyzeWithAI, getMoodSuggestions
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be used within TaskProvider');
  return context;
};