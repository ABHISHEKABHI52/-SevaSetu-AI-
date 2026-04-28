const { auth, db } = require('../config/firebaseAdmin');

async function verifyFirebaseToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const [, idToken] = authHeader.split(' ');

    if (!idToken) {
      return res.status(401).json({ success: false, message: 'Missing Authorization Bearer token' });
    }

    const decodedToken = await auth.verifyIdToken(idToken);
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || null,
      role: userDoc.exists ? userDoc.data().role : null,
      profile: userDoc.exists ? userDoc.data() : null
    };

    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token', error: error.message });
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden: insufficient role' });
    }

    return next();
  };
}

module.exports = {
  verifyFirebaseToken,
  requireRole
};
