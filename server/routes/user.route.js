const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const User = require("../models/user.model.js");
const multer = require("multer");
const AWS = require("../aws"); 
const path = require("path");


if (!admin.apps.length) {
  const serviceAccount = require("../serviceAccountKey.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const upload = multer({ storage: multer.memoryStorage() });


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


const uploadToS3 = async (file) => {
  const fileName = `${Date.now()}-${file.originalname}`;
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: "public-read",
  };

  const data = await AWS.upload(params).promise();
  return data.Location; 
};

router.get("/profile", verifyFirebaseToken, async (req, res) => {
  const { uid, name, email, address, photoURL } = req.user;
  res.json({ success: true, user: { uid, name, email, address, photoURL } });
});

router.post("/address", verifyFirebaseToken, async (req, res) => {
  const { address } = req.body;
  if (!address) return res.status(400).json({ error: "Address is required" });

  req.user.address = address;
  await req.user.save();

  res.json({ success: true, message: "Address updated", address });
});

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

//  PUT /api/users/:uid → Update user profile by UID
router.put('/:uid', async (req, res) => {
  const { uid } = req.params;
  const { name, phone, address, profilePic } = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { uid },
      { name, phone, address, photoURL: profilePic },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ success: true, message: "User updated", user });
  } catch (err) {
    console.error("❌ Update failed:", err.message);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

//  GET /api/users/:uid → Get user by Firebase UID
router.get('/:uid', async (req, res) => {
  const uid = req.params.uid;
  try {
    const user = await User.findOne({ uid });
    if (!user) return res.status(404).send("User not found");
    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
