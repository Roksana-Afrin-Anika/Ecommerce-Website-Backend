const mongoose = require("mongoose");
// Define schema for individual cart items
const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
});

// Define the main cart schema
const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [cartItemSchema], // Embed cartItemSchema as an array of items in the cart
  },
  { timestamps: true }
);

// Export the Cart model
const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
