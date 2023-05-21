const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    cart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
    },
    products_snapshot: Array,
    delivery_status: {
      type: String,
      enum: ["Menunggu pembayaran", "Diproses", "Dalam pengiriman"],
      default: "Menunggu pembayaran",
    },
    delivery_address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Delivery-Address",
    },
    total_quantity: {
      type: Number,
      required: [true, "total_quantity tidak boleh kosong"],
    },
    total_price: {
      type: Number,
      required: [true, "total_price tidak boleh kosong"],
    },
  }, {timestamps: true}
);

module.exports = mongoose.model("Order", orderSchema);