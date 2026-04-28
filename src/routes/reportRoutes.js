const express = require('express');
const { submitReport, listReports } = require('../controllers/reportController');
const { verifyFirebaseToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/submit-report', verifyFirebaseToken, submitReport);
router.get('/', verifyFirebaseToken, listReports);

module.exports = router;
