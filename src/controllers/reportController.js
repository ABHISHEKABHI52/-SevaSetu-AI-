const { db } = require('../config/firebaseAdmin');
const { createReport } = require('../services/firestoreService');
const { analyzeReportText } = require('../services/geminiService');

async function submitReport(req, res, next) {
  try {
    const { organizationId, submittedBy, sourceType = 'manual', rawText = '', fileUrl = '' } = req.body;

    if (!organizationId || !submittedBy || !rawText) {
      return res.status(400).json({ success: false, message: 'organizationId, submittedBy, and rawText are required' });
    }

    const report = await createReport({
      organizationId,
      submittedBy,
      sourceType,
      rawText,
      fileUrl
    });

    if (process.env.ENABLE_GEMINI_AUTO_ANALYSIS === 'true') {
      const aiResult = await analyzeReportText(rawText);
      await db.collection('reports').doc(report.id).set({
        ...aiResult,
        aiStatus: 'processed',
        processedAt: new Date().toISOString()
      }, { merge: true });
    }

    return res.status(201).json({ success: true, reportId: report.id, aiStatus: 'pending', message: 'Report submitted successfully' });
  } catch (error) {
    return next(error);
  }
}

async function listReports(req, res, next) {
  try {
    const { organizationId, aiStatus, urgencyLevel } = req.query;
    let query = db.collection('reports').orderBy('createdAt', 'desc');

    if (organizationId) {
      query = query.where('organizationId', '==', organizationId);
    }

    if (aiStatus) {
      query = query.where('aiStatus', '==', aiStatus);
    }

    if (urgencyLevel) {
      query = query.where('urgencyLevel', '==', urgencyLevel);
    }

    const snapshot = await query.limit(50).get();
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  submitReport,
  listReports
};
