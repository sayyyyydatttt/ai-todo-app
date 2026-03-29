const express = require('express');
const router = express.Router();
const {
  analyzeTask,
  moodSuggestions,
  generateBreakdown
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/analyze', analyzeTask);
router.post('/mood', moodSuggestions);
router.post('/breakdown/:id', generateBreakdown);

module.exports = router;