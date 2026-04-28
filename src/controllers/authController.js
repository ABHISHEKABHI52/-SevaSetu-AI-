const { auth } = require('../config/firebaseAdmin');
const { createUserProfile } = require('../services/firestoreService');

async function register(req, res, next) {
  try {
    const { name, email, password, role, phone, organizationId, skills = [], availability = {}, location = {}, preferredRadiusKm = 10, languages = [] } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'name, email, password, and role are required' });
    }

    const userRecord = await auth.createUser({
      displayName: name,
      email,
      password
    });

    await createUserProfile(userRecord.uid, {
      name,
      email,
      role,
      phone: phone || '',
      organizationId: organizationId || null,
      skills,
      availability,
      location,
      preferredRadiusKm,
      languages,
      active: true
    });

    return res.status(201).json({ success: true, uid: userRecord.uid, message: 'User registered successfully' });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ success: false, message: 'idToken is required' });
    }

    const decodedToken = await auth.verifyIdToken(idToken);

    return res.json({
      success: true,
      uid: decodedToken.uid,
      email: decodedToken.email || null,
      message: 'Login verified'
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token', error: error.message });
  }
}

module.exports = {
  register,
  login
};
