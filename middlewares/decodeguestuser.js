const jwt = require("jsonwebtoken");
const { jwt_secret, jwt_expires } = require("../config");

exports.decodeGuestCart = (req, res, next) => {
  const token =
    req.cookies.cartToken || req.headers.authorization?.split(" ")[1];

  if (!token) {
    req.cart = [];
    return next();
  }

  try {
    const decoded = jwt.verify(token, jwt_secret);
    req.cart = decoded.cart;
    next();
  } catch (error) {
    req.cart = [];
    next();
  }
};
