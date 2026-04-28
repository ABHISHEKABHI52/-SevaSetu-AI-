const { db } = require('../config/firebaseAdmin');
const { matchVolunteersForTask } = require('../services/matchingService');

async function matchVolunteers(req, res, next) {
  try {
    const { taskId } = req.body;

    if (!taskId) {
      return res.status(400).json({ success: false, message: 'taskId is required' });
    }

    const taskDoc = await db.collection('tasks').doc(taskId).get();

    if (!taskDoc.exists) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const matches = await matchVolunteersForTask(taskDoc.data());

    return res.json({ success: true, taskId, matches });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  matchVolunteers
};
