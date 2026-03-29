const Task = require('../models/Task');

// ============================
// Smart Priority Detection
// ============================
const detectPriority = (title, description = '') => {
  const text = (title + ' ' + description).toLowerCase();

  const urgentKeywords = ['urgent', 'asap', 'emergency', 'critical', 'immediately', 'deadline today'];
  const highKeywords = ['important', 'high priority', 'must', 'required', 'exam', 'interview', 'submit'];
  const lowKeywords = ['later', 'someday', 'maybe', 'optional', 'whenever', 'chill'];

  if (urgentKeywords.some(k => text.includes(k))) return 'urgent';
  if (highKeywords.some(k => text.includes(k))) return 'high';
  if (lowKeywords.some(k => text.includes(k))) return 'low';
  return 'medium';
};

// ============================
// Smart Deadline Suggestion
// ============================
const suggestDeadline = (title, description = '', priority = 'medium') => {
  const text = (title + ' ' + description).toLowerCase();
  const now = new Date();

  // Check for time hints in text
  if (text.includes('today')) {
    return new Date(now.setHours(23, 59, 0, 0));
  }
  if (text.includes('tomorrow')) {
    return new Date(now.setDate(now.getDate() + 1));
  }
  if (text.includes('this week') || text.includes('week')) {
    return new Date(now.setDate(now.getDate() + 7));
  }
  if (text.includes('next week')) {
    return new Date(now.setDate(now.getDate() + 14));
  }
  if (text.includes('month')) {
    return new Date(now.setDate(now.getDate() + 30));
  }

  // Default by priority
  const daysMap = { urgent: 1, high: 3, medium: 7, low: 14 };
  const days = daysMap[priority] || 7;
  return new Date(now.setDate(now.getDate() + days));
};

// ============================
// Task Breakdown into Steps
// ============================
const breakdownTask = (title) => {
  const text = title.toLowerCase();

  // Pre-built breakdowns for common task types
  const breakdowns = {
    essay: [
      'Research the topic and gather sources',
      'Create an outline with main points',
      'Write the introduction',
      'Write body paragraphs',
      'Write conclusion',
      'Proofread and edit'
    ],
    presentation: [
      'Define the topic and audience',
      'Research and collect content',
      'Create slide structure/outline',
      'Design slides with visuals',
      'Add speaker notes',
      'Practice and rehearse'
    ],
    assignment: [
      'Read the assignment brief carefully',
      'Research the required topics',
      'Create a rough draft',
      'Review and improve the draft',
      'Format according to requirements',
      'Submit before deadline'
    ],
    project: [
      'Define project goals and scope',
      'Break into smaller milestones',
      'Set up development environment',
      'Build core features',
      'Test everything thoroughly',
      'Document and deploy'
    ],
    study: [
      'Gather all study materials',
      'Review notes and highlights',
      'Make a summary sheet',
      'Practice with past questions',
      'Identify weak areas',
      'Final review'
    ],
    workout: [
      'Warm up for 5 minutes',
      'Complete main workout sets',
      'Cool down stretches',
      'Log workout progress'
    ],
    meeting: [
      'Prepare agenda topics',
      'Review relevant documents',
      'Attend the meeting',
      'Take notes on key points',
      'Follow up on action items'
    ]
  };

  // Match task to a breakdown template
  for (const [key, steps] of Object.entries(breakdowns)) {
    if (text.includes(key)) {
      return steps.map(step => ({ step, isCompleted: false }));
    }
  }

  // Generic breakdown if no match
  return [
    { step: `Plan and outline: ${title}`, isCompleted: false },
    { step: 'Gather necessary resources', isCompleted: false },
    { step: 'Start working on the task', isCompleted: false },
    { step: 'Review and refine', isCompleted: false },
    { step: 'Complete and verify', isCompleted: false }
  ];
};

// ============================
// Mood-Based Suggestions
// ============================
const getMoodSuggestions = (mood, tasks) => {
  const pendingTasks = tasks.filter(t => !t.isCompleted);

  if (mood === 'productive') {
    // Return high priority + overdue tasks
    const suggestions = pendingTasks
      .filter(t => t.priority === 'urgent' || t.priority === 'high')
      .slice(0, 5);

    return {
      mood: 'productive',
      message: "🔥 You're in beast mode! Tackle these high-impact tasks:",
      tasks: suggestions,
      tip: 'Use the Pomodoro timer — 25 min focused work, 5 min break. You got this!'
    };
  }

  if (mood === 'lazy') {
    // Return quick, easy, low priority tasks
    const suggestions = pendingTasks
      .filter(t => t.priority === 'low' || t.estimatedMinutes <= 15)
      .slice(0, 3);

    return {
      mood: 'lazy',
      message: "😴 Taking it easy? Here are some quick wins:",
      tasks: suggestions,
      tip: 'Even small progress counts. Try completing just 1 task today!'
    };
  }

  if (mood === 'stressed') {
    const suggestions = pendingTasks
      .filter(t => t.estimatedMinutes <= 20)
      .slice(0, 3);

    return {
      mood: 'stressed',
      message: "😤 Feeling overwhelmed? Let's start small:",
      tasks: suggestions,
      tip: 'Take a 5-minute break, then tackle one small task at a time.'
    };
  }

  // Default — balanced
  return {
    mood: 'balanced',
    message: "⚖️ Balanced mode — here's a healthy mix:",
    tasks: pendingTasks.slice(0, 5),
    tip: 'Mix quick tasks with important ones for a productive day!'
  };
};

// ============================
// @route   POST /api/ai/analyze
// @desc    Analyze task and return AI suggestions
// @access  Private
// ============================
const analyzeTask = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required'
      });
    }

    const priority = detectPriority(title, description);
    const suggestedDeadline = suggestDeadline(title, description, priority);
    const breakdown = breakdownTask(title);

    res.status(200).json({
      success: true,
      analysis: {
        suggestedPriority: priority,
        suggestedDeadline,
        breakdown,
        estimatedMinutes: breakdown.length * 15,
        tip: `This task was analyzed as "${priority}" priority based on its content.`
      }
    });
  } catch (error) {
    next(error);
  }
};

// ============================
// @route   POST /api/ai/mood
// @desc    Get mood-based task suggestions
// @access  Private
// ============================
const moodSuggestions = async (req, res, next) => {
  try {
    const { mood } = req.body;
    const tasks = await Task.find({ user: req.user.id, isCompleted: false });
    const suggestions = getMoodSuggestions(mood || 'balanced', tasks);

    res.status(200).json({
      success: true,
      suggestions
    });
  } catch (error) {
    next(error);
  }
};

// ============================
// @route   POST /api/ai/breakdown/:id
// @desc    Generate AI breakdown for existing task
// @access  Private
// ============================
const generateBreakdown = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task || task.user.toString() !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const breakdown = breakdownTask(task.title);

    task.aiBreakdown = breakdown;
    await task.save();

    res.status(200).json({
      success: true,
      message: 'AI breakdown generated!',
      breakdown,
      task
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { analyzeTask, moodSuggestions, generateBreakdown };