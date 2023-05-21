const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      minlength: [3, "Panjang nama makanan minimal 3 karakter"],
      required: [true, "Nama makanan tidak boleh kosong"],
    },
    description: {
      type: String,
      maxlength: [1000, "Panjang deskripsi minimal 1000 karakter"],
    },
    price: {
      type: Number,
      default: 0,
    },
    image_url: String,
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    tags: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tag",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
