const admin = require('firebase-admin');

let appInstance;

function initializeFirebaseAdmin() {
  if (appInstance) {
    return appInstance;
  }

  if (admin.apps.length > 0) {
    appInstance = admin.app();
    return appInstance;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined;

  if (projectId && clientEmail && privateKey) {
    appInstance = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey
      })
    });
  } else {
    appInstance = admin.initializeApp();
  }

  return appInstance;
}

initializeFirebaseAdmin();

const auth = admin.auth();
const db = admin.firestore();
const timestamp = admin.firestore.FieldValue.serverTimestamp;

module.exports = {
  admin,
  auth,
  db,
  timestamp
};
