const { Schema, model } = require("mongoose");

const planSchema = new Schema({
  billingPlan: {
    type: String,
    enum: ["basic", "premium"],
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  status: String,
  expiresAt: {
    type: Date,
    default: function () {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    },
    expires: 0,
  },
});

module.exports = model("Plan", planSchema);
