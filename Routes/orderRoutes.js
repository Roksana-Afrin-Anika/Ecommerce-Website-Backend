const express = require("express");
const router = express.Router();
const Order = require("./../Models/order");
const Cart = require("./../Models/cart");
const Product = require("./../Models/product");
const { jwtAuthMiddleware } = require("./../jwt");

// Place a new order
router.post("/create", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.userData.id;

    // Find the user's cart
    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Prepare order items and calculate total amount
    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price * item.quantity,
    }));

    const totalAmount = orderItems.reduce((sum, item) => sum + item.price, 0);

    // Create a new order
    const order = new Order({
      user: userId,
      items: orderItems,
      totalAmount,
      status: "Pending",
      paymentStatus: "Unpaid",
    });

    await order.save();

    // Clear the user's cart after order creation
    await Cart.findOneAndUpdate({ user: userId }, { items: [] });

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all orders for the authenticated user
router.get("/", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.userData.id;
    const orders = await Order.find({ user: userId }).populate("items.product");

    if (!orders) {
      return res.status(404).json({ message: "No orders found" });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get details of a specific order
router.get("/:orderId", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.userData.id;
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, user: userId }).populate(
      "items.product"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update order status (e.g., for admin or user to cancel an order)
router.put("/:orderId/status", jwtAuthMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, paymentStatus } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update order status and payment status if provided
    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();
    res
      .status(200)
      .json({ message: "Order status updated successfully", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
