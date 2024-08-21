const { model, Schema } = require("mongoose");
const fs = require("fs");
const { server } = require("../config");

const productSchema = new Schema({
  productName: {
    type: String,
    required: true,
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  productType: {
    type: String,
    required: true,
  },
  header: {
    type: String,
    required: true,
  },
  link: {
    text: String,
    url: String,
  },
  description: {
    type: String,
    required: true,
  },
  images: [
    {
      url: String,
    },
  ],
  additionalDetails: {
    gender: String,
    seller: String,
    quantity: Number,
    sizes: [
      {
        type: String,
      },
    ],
    address: String,
    services: String,
    phone: String,
  },
  prices: {
    actualPrice: {
      type: String,
      required: true,
    },
    discount: {
      type: String,
      required: true,
    },
    shippingFee: {
      type: String,
    },
  },
  reviews: [
    {
      customerName: String,
      review: String,
    },
  ],
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  createdAt: {
    type: Date,
    required: true,
  },
  updatedAt: {
    type: Date,
    required: true,
  },
  deliveryPreference: {
    handleDelivery: {
      type: Boolean,
    },
    deliveryService: {
      type: String,
      enum: ["swift_logistics"],
    },
  },
});
productSchema.methods.removeImage = function (id) {
  const images = this.images;
  const imageIndex = images.findIndex(
    (img) => img._id.toString() === id.toString()
  );
  if (imageIndex > -1) {
    currentImage = images[imageIndex];
    currentImageUrl = currentImage.url.replace(server, "./public");
    fs.unlinkSync(currentImageUrl);
  }
  const newImages = images.filter(
    (img) => img._id.toString() !== id.toString()
  );
  this.images = newImages;
  return this.save();
};
module.exports = model("Product", productSchema);
