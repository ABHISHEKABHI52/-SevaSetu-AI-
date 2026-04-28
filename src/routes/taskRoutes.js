const express = require('express');
const { createTaskHandler, listTasks, assignTask, classifyTaskHandler } = require('../controllers/taskController');
const { verifyFirebaseToken, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create-task', verifyFirebaseToken, requireRole('admin', 'ngo'), createTaskHandler);
router.get('/', verifyFirebaseToken, listTasks);
router.post('/assign-task', verifyFirebaseToken, requireRole('admin', 'ngo'), assignTask);
router.post('/classify-task', verifyFirebaseToken, requireRole('admin', 'ngo'), classifyTaskHandler);

module.exports = router;
