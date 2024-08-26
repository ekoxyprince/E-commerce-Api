const jwt = require("jsonwebtoken");
const { jwt_secret } = require("../config");
const Product = require("../models/product");

const generateGuestCartToken = (cart) => {
  return jwt.sign({ cart }, jwt_secret, { expiresIn: "7d" });
};
exports.addItemToGuestCart = async (req, res) => {
  try {
    const { id } = req.body;

    // Initialize cart from req.cart or create an empty array if it doesn't exist
    let cart = req.cart || [];

    // Fetch the product details from the database
    const product = await Product.findOne({ productType: "product", _id: id });
    if (product) {
      // Find if the product already exists in the cart
      const existingItemIndex = cart.findIndex(
        (item) => item.product.id.toString() === id.toString()
      );

      if (existingItemIndex > -1) {
        // If the product exists in the cart, update the quantity and total price
        cart[existingItemIndex].quantity += 1;
        cart[existingItemIndex].total =
          cart[existingItemIndex].quantity *
          (product.prices.actualPrice - product.prices.discount);
      } else {
        // If the product is new in the cart, add it with initial quantity and total price
        const cartItem = {
          product: {
            productName: product.productName,
            imageUrl: product.images[0].url,
            vendorid: product.userId,
            id: product._id,
            price: product.prices.actualPrice - product.prices.discount,
          },
          quantity: 1,
          total: product.prices.actualPrice - product.prices.discount,
          shipping: product.prices.shippingFee || 0,
        };
        cart.push(cartItem);
      }
      const cartToken = generateGuestCartToken(cart);
      console.log("Generated Cart Token");

      res.cookie("cartToken", cartToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
      });

      res.status(200).json({
        success: true,
        code: 200,
        status: "success",
        data: cart,
      });
    } else {
      res.status(404).json({
        success: false,
        code: 404,
        status: "error",
        msg: "Product not found",
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
exports.removeItemFromGuestCart = async (req, res) => {
  try {
    const { id } = req.body;

    let cart = req.cart || [];

    const existingItemIndex = cart.findIndex(
      (item) => item.product.id.toString() === id.toString()
    );

    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity -= 1;

      if (cart[existingItemIndex].quantity <= 0) {
        cart.splice(existingItemIndex, 1);
      } else {
        cart[existingItemIndex].total =
          cart[existingItemIndex].quantity *
          cart[existingItemIndex].product.price;
      }

      const cartToken = generateGuestCartToken(cart);
      console.log("Updated Cart Token");

      res.cookie("cartToken", cartToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        code: 200,
        status: "success",
        data: cart,
      });
    } else {
      res.status(404).json({
        success: false,
        code: 404,
        status: "error",
        msg: "Product not found in cart",
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


exports.fetchGuestCart = (req, res) => {
  try {
    const cart = req.cart || [];

    res.status(200).json({
      success: true,
      code: 200,
      status: "success",
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      code: 500,
      status: "error",
      msg: "Internal server error",
    });
  }
};

