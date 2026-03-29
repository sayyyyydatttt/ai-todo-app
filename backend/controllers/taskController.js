const Task = require('../models/Task');

// ============================
// @route   GET /api/tasks
// @desc    Get all tasks for logged-in user
// @access  Private
// ============================
const getTasks = async (req, res, next) => {
  try {
    // Extract filter options from query string
    // e.g. /api/tasks?status=todo&priority=high
    const {
      status,
      priority,
      category,
      search,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build filter object
    const filter = { user: req.user.id };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    // Search in title and description
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Sort options
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = {};

    // Pinned tasks always come first
    sortObj.isPinned = -1;
    sortObj[sortBy] = sortOrder;

    const tasks = await Task.find(filter).sort(sortObj);

    // Calculate stats
    const stats = {
      total: tasks.length,
      completed: tasks.filter(t => t.isCompleted).length,
      pending: tasks.filter(t => !t.isCompleted).length,
      high: tasks.filter(t => t.priority === 'high').length,
      urgent: tasks.filter(t => t.priority === 'urgent').length,
    };

    res.status(200).json({
      success: true,
      count: tasks.length,
      stats,
      tasks
    });
  } catch (error) {
    next(error);
  }
};

// ============================
// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
// ============================
const createTask = async (req, res, next) => {
  try {
    const {
      title, description, priority,
      category, tags, dueDate, estimatedMinutes
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required'
      });
    }

    const task = await Task.create({
      user: req.user.id,  // Link task to logged-in user
      title,
      description,
      priority: priority || 'medium',
      category: category || 'general',
      tags: tags || [],
      dueDate: dueDate || null,
      estimatedMinutes: estimatedMinutes || 30
    });

    res.status(201).json({
      success: true,
      message: 'Task created!',
      task
    });
  } catch (error) {
    next(error);
  }
};

// ============================
// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
// ============================
const updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    // Check task exists
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check task belongs to this user
    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task'
      });
    }

    // If marking as complete, set completedAt timestamp
    if (req.body.isCompleted === true && !task.isCompleted) {
      req.body.completedAt = new Date();
      req.body.status = 'completed';
    }

    // If un-completing a task
    if (req.body.isCompleted === false) {
      req.body.completedAt = null;
      req.body.status = 'todo';
    }

    task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Task updated!',
      task
    });
  } catch (error) {
    next(error);
  }
};

// ============================
// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
// ============================
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Security check — only owner can delete
    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this task'
      });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// ============================
// @route   PUT /api/tasks/:id/toggle
// @desc    Toggle task complete/incomplete
// @access  Private
// ============================
const toggleTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    task.isCompleted = !task.isCompleted;
    task.status = task.isCompleted ? 'completed' : 'todo';
    task.completedAt = task.isCompleted ? new Date() : null;

    await task.save();

    res.status(200).json({
      success: true,
      message: task.isCompleted ? '✅ Task completed!' : '↩️ Task reopened',
      task
    });
  } catch (error) {
    next(error);
  }
};

// ============================
// @route   PUT /api/tasks/:id/pin
// @desc    Pin / Unpin a task
// @access  Private
// ============================
const pinTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task || task.user.toString() !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    task.isPinned = !task.isPinned;
    await task.save();

    res.status(200).json({
      success: true,
      message: task.isPinned ? '📌 Task pinned!' : 'Task unpinned',
      task
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTask,
  pinTask
};