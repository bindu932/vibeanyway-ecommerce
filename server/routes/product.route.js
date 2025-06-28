const express = require("express");
const router = express.Router();
const {
  upload,
  createProduct,
  getAllProducts,
  deleteProduct,
  updateProduct,
  getProductById  
} = require("../controllers/product.controller");

router.post("/", upload.single("image"), createProduct);
router.get("/", getAllProducts);
router.get("/:id", getProductById); 
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
