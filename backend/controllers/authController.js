const User = require('../models/User');
const jwt = require('jsonwebtoken');

// ============================
// Helper: Generate JWT Token
// ============================
const generateToken = (id) => {
  return jwt.sign(
    { id },                          // Payload — what's inside the token
    process.env.JWT_SECRET,          // Secret key to sign it
    { expiresIn: '30d' }             // Token expires in 30 days
  );
};

// ============================
// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
// ============================
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // --- Validation ---
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // --- Check if user already exists ---
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // --- Create user (password is auto-hashed by User model) ---
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password
    });

    // --- Generate token ---
    const token = generateToken(user._id);

    // --- Send response ---
    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    next(error); // Pass to error handler middleware
  }
};

// ============================
// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
// ============================
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // --- Validation ---
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // --- Find user (include password for comparison) ---
    const user = await User.findOne({
      email: email.toLowerCase()
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // --- Compare password ---
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password' // Same message (security)
      });
    }

    // --- Generate token ---
    const token = generateToken(user._id);

    // --- Send response ---
    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    next(error);
  }
};

// ============================
// @route   GET /api/auth/me
// @desc    Get current logged-in user
// @access  Private (requires token)
// ============================
const getMe = async (req, res, next) => {
  try {
    // req.user is set by the protect middleware
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// ============================
// @route   PUT /api/auth/preferences
// @desc    Update user preferences
// @access  Private
// ============================
const updatePreferences = async (req, res, next) => {
  try {
    const { theme, pomodoroWork, pomodoroBreak } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        preferences: {
          theme: theme || 'dark',
          pomodoroWork: pomodoroWork || 25,
          pomodoroBreak: pomodoroBreak || 5
        }
      },
      { new: true } // Return updated document
    );

    res.status(200).json({
      success: true,
      message: 'Preferences updated!',
      preferences: user.preferences
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updatePreferences };