const express = require('express');
const { matchVolunteers } = require('../controllers/matchingController');
const { verifyFirebaseToken, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/match-volunteers', verifyFirebaseToken, requireRole('admin', 'ngo'), matchVolunteers);

module.exports = router;
