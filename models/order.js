const { Schema, model } = require("mongoose");

const orderSchema = new Schema({
  orderNo: {
    type: Number,
    default: Math.floor(Math.random() * 900000 + 100000),
    required: true,
    unique: true,
  },
  items: [
    {
      quantity: Number,
      product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
      vendorid: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      commission: Number,
      total: Number,
    },
  ],

  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  total: Number,
  totalCommission: Number,
  status: String,
  address: Object,
  createdAt: Date,
  updatedAt: Date,
});
module.exports = model("Order", orderSchema);
