const mongoose = require("mongoose");

// Define the schema for cart items
const cartItemSchema = new mongoose.Schema({
  product: {
    productName: String,
    imageUrl: String,
    vendorid: mongoose.Schema.Types.ObjectId,
    id: mongoose.Schema.Types.ObjectId,
    price: Number,
  },
  quantity: Number,
  total: Number,
  shipping: Number,
});

// Define the schema for the cart
const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to User schema if you're linking carts to users
      required: true,
    },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

// Create the model
const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
