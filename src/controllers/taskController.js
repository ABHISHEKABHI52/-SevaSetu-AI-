const { db, admin, timestamp } = require('../config/firebaseAdmin');
const { createTask, createAssignment } = require('../services/firestoreService');
const { classifyTask } = require('../services/geminiService');

async function createTaskHandler(req, res, next) {
  try {
    const { reportId, organizationId, title, description, requiredSkills = [], location = {}, capacityNeeded = 1, deadline = null, category = 'general_support' } = req.body;

    if (!organizationId || !title || !description) {
      return res.status(400).json({ success: false, message: 'organizationId, title, and description are required' });
    }

    const task = await createTask({
      reportId,
      organizationId,
      title,
      description,
      requiredSkills,
      location,
      capacityNeeded,
      deadline,
      category
    });

    return res.status(201).json({ success: true, taskId: task.id, status: task.status, message: 'Task created successfully' });
  } catch (error) {
    return next(error);
  }
}

async function listTasks(req, res, next) {
  try {
    const { organizationId, status, category } = req.query;
    let query = db.collection('tasks').orderBy('priorityScore', 'desc');

    if (organizationId) {
      query = query.where('organizationId', '==', organizationId);
    }

    if (status) {
      query = query.where('status', '==', status);
    }

    if (category) {
      query = query.where('category', '==', category);
    }

    const snapshot = await query.limit(50).get();
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

async function assignTask(req, res, next) {
  try {
    const { taskId, volunteerId, organizationId, assignmentStatus = 'assigned' } = req.body;

    if (!taskId || !volunteerId || !organizationId) {
      return res.status(400).json({ success: false, message: 'taskId, volunteerId, and organizationId are required' });
    }

    const assignment = await createAssignment({
      taskId,
      volunteerId,
      organizationId,
      assignmentStatus
    });

    await db.collection('tasks').doc(taskId).update({
      assignedCount: admin.firestore.FieldValue.increment(1),
      updatedAt: timestamp()
    });

    return res.status(201).json({ success: true, assignmentId: assignment.id, message: 'Task assigned successfully' });
  } catch (error) {
    return next(error);
  }
}

async function classifyTaskHandler(req, res, next) {
  try {
    const { taskText } = req.body;

    if (!taskText) {
      return res.status(400).json({ success: false, message: 'taskText is required' });
    }

    const classification = await classifyTask(taskText);
    return res.json({ success: true, data: classification });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createTaskHandler,
  listTasks,
  assignTask,
  classifyTaskHandler
};
