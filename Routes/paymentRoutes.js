const express = require("express");
const router = express.Router();
const Payment = require("../Models/payment");
const Order = require("../Models/order");
const { jwtAuthMiddleware } = require("./../jwt");

router.post("/create", jwtAuthMiddleware, async (req, res) => {
  console.log("Request Body:", req.body); // Log the request body for debugging

  try {
    // Get user id from the token
    const userId = req.user.userData.id;
    const { items, amount, paymentMethod } = req.body;

    // Check if required data is present
    if (!items || !amount || !paymentMethod) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Calculate the total amount from the items
    let calculatedAmount = 0;
    items.forEach((item) => {
      // Check for productId, quantity, and price
      if (!item.productId || !item.price || !item.quantity) {
        throw new Error("Invalid item data");
      }
      calculatedAmount += item.quantity * item.price; // Sum item total
    });

    console.log("Calculated Amount:", calculatedAmount);
    console.log("Amount received from frontend:", amount);

    // Check if the calculated amount matches the amount sent in the request
    if (calculatedAmount !== amount) {
      return res.status(400).json({ message: "Amount mismatch" });
    }

    // Create a new order based on the items
    const order = new Order({
      user: userId,
      items,
      totalAmount: calculatedAmount,
      paymentStatus: "Unpaid", // Set as unpaid initially
    });

    // Save the order
    await order.save();
    console.log("Order created:", order);

    // Create a new payment record
    const payment = new Payment({
      order: order._id,
      user: userId,
      amount,
      paymentMethod,
      status: "Success", // Or "Pending" depending on your flow
    });

    // Save the payment record
    await payment.save();
    console.log("Payment created:", payment);

    // Update the order's payment status to "Paid"
    order.paymentStatus = "Paid";
    await order.save();
    console.log("Order payment status updated to Paid");

    // Send success response with orderId
    res.status(201).json({ message: "Payment successful", orderId: order._id });
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

module.exports = router;
