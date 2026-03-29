const express = require('express');
const router = express.Router();
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTask,
  pinTask
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

// All task routes are protected (require login)
router.use(protect);

router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

router.put('/:id/toggle', toggleTask);
router.put('/:id/pin', pinTask);

module.exports = router;