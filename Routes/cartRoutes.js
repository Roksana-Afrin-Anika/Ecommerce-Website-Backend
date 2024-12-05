const express = require("express");
const router = express.Router();
const Cart = require("./../Models/cart");
const Product = require("../Models/product");
const { jwtAuthMiddleware, generateToken } = require("./../jwt");

// Add product to cart
router.post("/add", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.userData.id;
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    // Find the user's cart
    let cart = await Cart.findOne({ user: userId });

    // If no cart exists, create a new one for the user
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Fetch the product details (name)
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if the product is already in the cart
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex >= 0) {
      // Update quantity if product is already in cart
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Add new item if not already in cart
      cart.items.push({
        product: productId,
        quantity,
      });
    }
    console.log("Product Name: ", product.name); // Add this for debugging

    // Save the cart (whether it's new or updated)
    await cart.save();

    // Populate the cart items with product details (like name)
    const populatedCart = await Cart.findById(cart._id).populate(
      "items.product", // Populate the 'product' field in cart items
      "name" // Only fetch the 'name' of the product
    );

    // Send the updated cart with product details
    res.status(200).json({
      message: "Product added to cart successfully",
      cart: populatedCart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get cart items for the user
router.get("/", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.userData.id;

    // Find the cart and populate the product details (e.g., name, price)
    const cart = await Cart.findOne({ user: userId }).populate({
      path: "items.product", // Populate the product reference
      select: "name price", // Select fields to fetch from the product document
    });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Send the cart items with populated product details
    res.status(200).json({ items: cart.items });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update item quantity in the cart
router.put("/update", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.userData.id;
    const { productId, quantity } = req.body;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );
    if (itemIndex >= 0) {
      cart.items[itemIndex].quantity = quantity; // Update quantity
      await cart.save();

      // Populate the cart items with product details (like name)
      const populatedCart = await Cart.findById(cart._id).populate(
        "items.product",
        "name price imageUrl"
      );

      res
        .status(200)
        .json({ message: "Cart updated successfully", cart: populatedCart });
    } else {
      res.status(404).json({ message: "Product not found in cart" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Remove item from cart
router.delete("/remove", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.userData.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    // Find the user's cart
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find the index of the item to be removed
    const itemIndex = cart.items.findIndex(
      (item) => item.product?.toString() === productId // Using optional chaining
    );

    if (itemIndex >= 0) {
      // Remove the item from the cart
      cart.items.splice(itemIndex, 1);
      await cart.save();

      // Populate the cart items with product details (like name)
      const populatedCart = await Cart.findById(cart._id).populate(
        "items.product",
        "name price imageUrl"
      );

      return res
        .status(200)
        .json({ message: "Item removed from cart", cart: populatedCart });
    } else {
      return res.status(404).json({ message: "Product not found in cart" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = router;
