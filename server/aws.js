// aws.js
const AWS = require("aws-sdk");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Configure AWS S3 instance
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,       // From .env
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // From .env
  region: process.env.AWS_REGION,                    // From .env
});

module.exports = s3;
