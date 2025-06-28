const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
async function verifyFirebaseToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split('Bearer ')[1]
      : null;

    if (!token) {
      return res.status(401).json({ success: false, error: 'Missing or invalid token' });
    }

    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded; // Contains uid, email, etc.
    next();
  } catch (err) {
    console.error('Firebase Auth Error:', err.message);
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid token' });
  }
}

module.exports = { verifyFirebaseToken };
