const express = require("express");
const router = express.Router();
const User = require("./../Models/user");
const Product = require("./../Models/product");
const { jwtAuthMiddleware, generateToken } = require("./../jwt");

const checkAdminRole = async (userID) => {
  try {
    const user = await User.findById(userID); //Here userID is the identifier giver by mongoDB
    if (user.role === "admin") return true;
  } catch (err) {
    return false;
  }
};

const adminAuthMiddleware = async (req, res, next) => {
  try {
    const isAdmin = await checkAdminRole(req.user.userData.id);
    if (isAdmin) {
      next(); // User is admin, proceed to the next middleware or route handler
    } else {
      res.status(403).json({ message: "Access denied. Admins only." });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Route to get products (with optional category filter)
router.get("/", async (req, res) => {
  try {
    const { category } = req.query; // Read 'category' from query parameters

    const filter = category ? { category } : {}; // Filter by category if provided
    const products = await Product.find(filter);

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Unable to retrieve products" });
  }
});

// Route to get a specific product by ID (Product Detail Page)
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Unable to retrieve product" });
  }
});

// Route to create a new product (Admin only)
router.post("/", jwtAuthMiddleware, adminAuthMiddleware, async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Unable to create product" });
  }
});

// Route to update an existing product (Admin only)
router.put("/:id", jwtAuthMiddleware, adminAuthMiddleware, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Unable to update product" });
  }
});

// Route to delete a product (Admin only)
router.delete(
  "/:id",
  jwtAuthMiddleware,
  adminAuthMiddleware,
  async (req, res) => {
    try {
      const deletedProduct = await Product.findByIdAndDelete(req.params.id);
      if (!deletedProduct) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Unable to delete product" });
    }
  }
);
module.exports = router;
