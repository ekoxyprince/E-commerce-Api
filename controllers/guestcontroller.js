const jwt = require("jsonwebtoken");
const { jwt_secret } = require("../config");
const Product = require("../models/product");
const Cart = require("../models/cart");

const generateGuestCartToken = (cart) => {
  return jwt.sign({ cart }, jwt_secret, { expiresIn: "7d" });
};
exports.addItemToGuestCart = async (req, res) => {
  
};

exports.removeItemFromGuestCart = async (req, res) => {
 
};

exports.fetchCart = async (req, res) => {
  try {
    if (req.user) {
      // Handle cart for logged-in users
      let cart = await Cart.findOne({ userId: req.user._id });
      if (!cart) {
        // Create a new cart if none exists
        cart = new Cart({ userId: req.user._id, items: [] });
        await cart.save(); // Ensure to save the new cart
      }
      res.status(200).json({
        success: true,
        code: 200,
        status: "success",
        data: cart.items, // Send the cart items
      });
    } else {
      // Handle cart for guest users
      const cart = req.cart || []; // Default to empty array if no cart in req
      res.status(200).json({
        success: true,
        code: 200,
        status: "success",
        data: cart,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      code: 500,
      status: "error",
      msg: "Internal server error",
    });
  }
};
