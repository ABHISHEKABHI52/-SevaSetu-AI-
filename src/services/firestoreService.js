const { db, timestamp } = require('../config/firebaseAdmin');

function toPlainObject(data) {
  return JSON.parse(JSON.stringify(data || {}));
}

async function createUserProfile(uid, profile) {
  const payload = {
    ...profile,
    uid,
    createdAt: timestamp(),
    updatedAt: timestamp()
  };

  await db.collection('users').doc(uid).set(payload, { merge: true });
  return payload;
}

async function createReport(report) {
  const docRef = db.collection('reports').doc();
  const payload = {
    ...report,
    reportId: docRef.id,
    aiStatus: report.aiStatus || 'pending',
    suggestedTaskCreated: report.suggestedTaskCreated || false,
    createdAt: timestamp(),
    updatedAt: timestamp()
  };

  await docRef.set(payload);
  return { id: docRef.id, ...payload };
}

async function createTask(task) {
  const docRef = db.collection('tasks').doc();
  const payload = {
    ...task,
    taskId: docRef.id,
    status: task.status || 'open',
    assignedCount: task.assignedCount || 0,
    createdAt: timestamp(),
    updatedAt: timestamp()
  };

  await docRef.set(payload);

  if (task.reportId) {
    await db.collection('reports').doc(task.reportId).set({ suggestedTaskCreated: true, updatedAt: timestamp() }, { merge: true });
  }

  return { id: docRef.id, ...payload };
}

async function createAssignment(assignment) {
  const docRef = db.collection('assignments').doc();
  const payload = {
    ...assignment,
    assignmentId: docRef.id,
    assignmentStatus: assignment.assignmentStatus || 'suggested',
    createdAt: timestamp(),
    updatedAt: timestamp()
  };

  await docRef.set(payload);
  return { id: docRef.id, ...payload };
}

module.exports = {
  db,
  timestamp,
  toPlainObject,
  createUserProfile,
  createReport,
  createTask,
  createAssignment
};
