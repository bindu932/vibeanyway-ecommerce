const Product = require("../models/product.model");
const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const admin = require("../config/firebaseAdmin");

//  Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, uuidv4() + ext);
  }
});
const upload = multer({ storage });

//  AWS S3 setup
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Create Product
const createProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      category,
      subcategory,
      sizes,
      stock
    } = req.body;

    const file = req.file;
    if (!file) return res.status(400).json({ message: "❌ Image file not found" });

    const fileStream = fs.createReadStream(file.path);
    const s3Params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `products/${file.filename}`,
      Body: fileStream,
      ContentType: file.mimetype
    };
    await s3.send(new PutObjectCommand(s3Params));

    const imageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/products/${file.filename}`;

    const parsedSizes = JSON.parse(sizes);
    const parsedStock = JSON.parse(stock);

    const newProduct = new Product({
      name,
      price,
      description,
      category,
      subcategory,
      sizes: parsedSizes,
      stock: parsedStock,
      imageUrl
    });

    await newProduct.save();

    await admin.firestore().collection("products").doc(newProduct._id.toString()).set({
      name,
      price,
      description,
      category,
      subcategory,
      sizes: parsedSizes,
      stock: parsedStock,
      imageUrl,
      createdAt: Date.now()
    });

    fs.unlinkSync(file.path);

    res.status(201).json({ message: "✅ Product added", product: newProduct });
  } catch (err) {
    console.error("❌ Upload Error:", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};

// ✅ Get All Products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: "❌ Failed to fetch products", error: err.message });
  }
};

// ✅ Get Product by ID
const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "❌ Product not found" });
    }
    res.status(200).json(product);
  } catch (err) {
    console.error("❌ Get Product by ID Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

//  Delete Product
const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Product.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ message: "❌ Product not found in MongoDB" });
    }

    await admin.firestore().collection("products").doc(id).delete();
    res.status(200).json({ message: "✅ Product deleted from MongoDB & Firestore" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ message: "Failed to delete product", error: err.message });
  }
};

//  Update Product
const updateProduct = async (req, res) => {
  const { id } = req.params;
  console.log("🔁 PUT /api/products/:id called with ID:", id);

  try {
    const updatedFields = { ...req.body };

    if (typeof updatedFields.sizes === 'string') {
      try {
        updatedFields.sizes = JSON.parse(updatedFields.sizes);
      } catch (e) {
        console.warn("⚠️ Failed to parse sizes:", updatedFields.sizes);
      }
    }

    if (typeof updatedFields.stock === 'string') {
      try {
        updatedFields.stock = JSON.parse(updatedFields.stock);
      } catch (e) {
        console.warn("⚠️ Failed to parse stock:", updatedFields.stock);
      }
    }

    // Use findOneAndUpdate to support both ObjectId and string _id
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: id },
      updatedFields,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "❌ Product not found in MongoDB" });
    }

    await admin.firestore().collection("products").doc(id).set(updatedFields, { merge: true });

    res.status(200).json({ message: "✅ Product updated", product: updatedProduct });
  } catch (err) {
    console.error("❌ Update Error:", err);
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};

module.exports = {
  upload,
  createProduct,
  getAllProducts,
  getProductById,
  deleteProduct,
  updateProduct
};
