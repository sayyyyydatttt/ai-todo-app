const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load env variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
app.get('/', (req, res) => {
  res.send("Backend is LIVE 🚀");
});

app.get('/test', (req, res) => {
  res.send("TEST WORKING");
});

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));


// ===== HEALTH CHECK =====
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🚀 AI Todo API is running!',
    timestamp: new Date().toISOString()
  });
});

app.use('/api', (req, res, next) => {
  console.log("API HIT:", req.originalUrl);
  next();
});

// ===== ROUTES =====

// Debug logs
console.log("Loading routes...");

// Auth routes
const authRoutes = require('./routes/auth');
console.log("Auth routes loaded:", typeof authRoutes);
app.use('/api/auth', authRoutes);

// Task routes
const taskRoutes = require('./routes/tasks');
console.log("Task routes loaded:", typeof taskRoutes);
app.use('/api/tasks', taskRoutes);

// AI routes
const aiRoutes = require('./routes/ai');
console.log("AI routes loaded:", typeof aiRoutes);
app.use('/api/ai', aiRoutes);


// ===== 404 HANDLER =====
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// ===== ERROR HANDLER =====
app.use(errorHandler);

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});