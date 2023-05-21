const mongoose = require("mongoose");

const tagSchema = mongoose.Schema(
  {
    name: {
      type: String,
      minlength: [3, "Panjang nama tag minimal 3 karakter"],
      maxlength: [20, "Panjang nama tag maksimal 20 karakter"],
      required: [true, "Nama tag wajib diisi"],
    }
  }
)

module.exports = mongoose.model("Tag", tagSchema);