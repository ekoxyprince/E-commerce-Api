const catchAsync = require("../utilities/catchasync");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const Order = require("../models/order");
const Product = require("../models/product");
const { getCart } = require("../middlewares/cache");
exports.checkOut = async (req, res, next) => {
  try {
    const cart = getCart();

    if (!cart || cart.length === 0) {
      return res.status(400).json({
        success: false,
        status: "error",
        code: 400,
        data: {
          msg: "Invalid cart details",
          path: "cart",
          value: null,
          location: "session",
        },
      });
    }

    const orderItems = [];
    let totalPrice = 0;
    let totalCommission = 0;
    const vendorIds = new Set();

    for (let item of cart) {
      const itemTotal = parseFloat(item.total) + parseFloat(item.shipping);
      const commission = item.total * 0.1;

      const orderItem = {
        product: item.product.id,
        total: itemTotal - commission,
        quantity: parseInt(item.quantity),
        vendorid: item.product.vendorid,
        commission: commission,
      };

      orderItems.push(orderItem);
      vendorIds.add(item.product.vendorid);
      totalPrice += itemTotal;
      totalCommission += commission;
    }

    const vendorIdsArray = Array.from(vendorIds);

    const order = await Order.create({
      items: orderItems,
      userId: req.user._id,
      total: totalPrice,
      totalCommission,
      address: req.user.location,
      vendorid: vendorIdsArray,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Clear the user's cart after order creation
    res.clearCookie("cartToken", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });

    res.status(201).json({
      success: true,
      status: "success",
      code: 201,
      data: {
        msg: "Order Successfully created",
        order,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserDetails = (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    status: "success",
    code: 200,
    data: {
      user,
      msg: "User found and fetched.",
    },
  });
};
exports.updateUserDetails = catchAsync(async (req, res, next) => {
  const body = req.body;
  req.user.fullname = body.fullname || req.user.fullname;
  req.user.location.address = body.address || req.user.address;
  req.user.location.state = body.state || req.user.location.state;
  req.user.location.city = body.city || req.user.location.city;
  req.user.location.zipcode = body.zipcode || req.user.location.zipcode;
  req.user.phone = body.phone || req.user.phone;
  req.user.image = body.image || req.user.image;
  const updatedUser = await req.user.save();
  res.status(200).json({
    success: true,
    status: "success",
    code: 200,
    data: { user: updatedUser, msg: "User details updated." },
  });
});
exports.updatedPassword = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      code: 422,
      status: "error",
      data: errors.array()[0],
    });
  }
  const { oldPassword, password } = req.body;
  const doMatch = await bcrypt.compare(oldPassword, req.user.password);
  if (!doMatch) {
    return res.status(401).json({
      success: false,
      status: "Unauthorized Request",
      status: 401,
      data: {
        path: "password",
        value: oldPassword,
        location: "body",
        msg: "Incorrect current password",
      },
    });
  }
  const hashedPassword = await bcrypt.hash(password, 12);
  req.user.password = hashedPassword;
  const updatedUser = await req.user.save();
  res.status(200).json({
    success: true,
    status: "success",
    code: 200,
    data: { msg: "Password updated successfully.", user: updatedUser },
  });
});
exports.getUserOrders = (req, res, next) => {
  Order.find({ userId: req.user._id })
    .populate("items.product")
    .then((orders) => {
      res.status(200).json({
        success: true,
        status: "success",
        code: 200,
        data: { msg: "Orders fetched successfully.", orders },
      });
    })
    .catch((error) => next(error));
};

exports.getSingleOrder = (req, res, next) => {
  const { id } = req.params;
  Order.findOne({ _id: id, userId: req.user._id })
    .populate("items.product")
    .then((order) => {
      if (!order) {
        return res.status(401).json({
          success: false,
          status: "Unauthorized Request",
          status: 401,
          data: {
            path: "id",
            value: id,
            location: "params",
            msg: "No order fetched!",
          },
        });
      }
      res.status(200).json({
        success: true,
        status: "success",
        code: 200,
        data: { msg: "Order fetched successfully.", order },
      });
    });
};
exports.fetchUserProducts = (req, res, next) => {
  Product.find({ userId: req.user._id })
    .then((products) => {
      res.status(200).json({
        success: true,
        status: "successful",
        code: 200,
        data: { products, msg: "User products fetched!" },
      });
    })
    .catch((error) => next(error));
};


