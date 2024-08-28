const { Schema, model } = require("mongoose");
const planSchema = new Schema({
  billingPlan: {
    type: String,
    enum: ["basic", "premium"],
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  amount: {
    type: Number,
    required: true,
  },
  created
});
module.exports = model("Order", planSchema);
