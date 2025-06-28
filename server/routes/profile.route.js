const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const User = require("../models/user.model.js");
const multer = require("multer");
const s3 = require("../aws");
const path = require("path");

// Firebase Admin Initialization
if (!admin.apps.length) {
  const serviceAccount = require("../serviceAccountKey.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

//  Multer config for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Firebase Token Verification Middleware
const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid token" });
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.firebaseUser = decoded;

    let user = await User.findOne({ uid: decoded.uid });

    if (!user) {
      user = new User({
        uid: decoded.uid,
        email: decoded.email,
        name: decoded.name || decoded.displayName || "Guest",
        photoURL: decoded.picture || "",
        address: ""
      });
      await user.save();
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err.message);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

//  Upload to S3 Helper - fixed to use imported s3 instance
const uploadToS3 = async (file) => {
  const fileName = `${Date.now()}-${file.originalname}`;
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: "public-read",
  };

  const data = await s3.upload(params).promise(); // use s3.upload
  return data.Location;
};

//Get User Profile
router.get("/profile", verifyFirebaseToken, async (req, res) => {
  const { uid, name, email, address, photoURL } = req.user;
  res.json({ success: true, user: { uid, name, email, address, photoURL } });
});

//  Update Address
router.post("/address", verifyFirebaseToken, async (req, res) => {
  const { address } = req.body;
  if (!address) return res.status(400).json({ error: "Address is required" });

  req.user.address = address;
  await req.user.save();

  res.json({ success: true, message: "Address updated", address });
});

//  Upload Photo
router.post("/photo", verifyFirebaseToken, upload.single("photo"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No photo uploaded" });

  try {
    const s3Url = await uploadToS3(req.file);
    req.user.photoURL = s3Url;
    await req.user.save();

    res.json({ success: true, message: "Photo uploaded", photoURL: s3Url });
  } catch (err) {
    console.error("❌ S3 upload error:", err.message);
    res.status(500).json({ error: "Photo upload failed" });
  }
});

//  Update Profile (Photo + Address)
router.post("/profile", verifyFirebaseToken, upload.single("photo"), async (req, res) => {
  try {
    if (req.body.address) {
      req.user.address = req.body.address;
    }

    if (req.file) {
      const s3Url = await uploadToS3(req.file);
      req.user.photoURL = s3Url;
    }

    await req.user.save();

    res.json({
      success: true,
      message: "Profile updated",
      user: {
        uid: req.user.uid,
        name: req.user.name,
        email: req.user.email,
        address: req.user.address,
        photoURL: req.user.photoURL,
      },
    });
  } catch (err) {
    console.error("❌ Profile update failed:", err.message);
    res.status(500).json({ success: false, error: "Profile update failed" });
  }
});

//  Get Firebase Users (Admin Utility)
router.get("/firebase", async (req, res) => {
  try {
    const getAllUsers = async (nextPageToken) => {
      const result = [];
      const list = await admin.auth().listUsers(1000, nextPageToken);

      list.users.forEach(userRecord => {
        result.push({
          uid: userRecord.uid,
          email: userRecord.email,
          name: userRecord.displayName || "N/A",
          phoneNumber: userRecord.phoneNumber || "N/A",
          creationTime: userRecord.metadata.creationTime || null,
          lastSignInTime: userRecord.metadata.lastSignInTime || null
        });
      });

      if (list.pageToken) {
        const moreUsers = await getAllUsers(list.pageToken);
        return result.concat(moreUsers);
      }

      return result;
    };

    const users = await getAllUsers();
    res.json(users);
  } catch (err) {
    console.error("❌ Firebase Auth user fetch failed:", err.message);
    res.status(500).json({ error: "Failed to fetch Firebase users" });
  }
});
//  Get All MongoDB Users (Customer Details)
router.get("/mongo", async (req, res) => {
  try {
    const users = await User.find({}, "-__v"); // Exclude version field
    res.json({ success: true, users });
  } catch (err) {
    console.error("❌ MongoDB user fetch failed:", err.message);
    res.status(500).json({ error: "Failed to fetch MongoDB users" });
  }
});

module.exports = router;
