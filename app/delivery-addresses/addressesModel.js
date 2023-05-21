const mongoose = require("mongoose");

const addressSchema = mongoose.Schema({
  label: {
    type: String,
    required: [true, "Label alamat wajib diisi"],
    maxlength: [32, "Panjang maksimal label adalah 32 karakter"],
  },
  kelurahan: {
    type: String,
    required: [true, "Kelurahan wajib diisi"],
    maxlength: [32, "Panjang maksimal kelurahan adalah 32 karakter"],
  },
  kecamatan: {
    type: String,
    required: [true, "Kecamatan wajib diisi"],
    maxlength: [32, "Panjang maksimal kecamatan adalah 32 karakter"],
  },
  kota: {
    type: String,
    required: [true, "Kota/kabupaten wajib diisi"],
    maxlength: [32, "Panjang maksimal kota/kabupaten adalah 32 karakter"],
  },
  provinsi: {
    type: String,
    required: [true, "Provinsi wajib diisi"],
    maxlength: [32, "Panjang maksimal provinsi adalah 32 karakter"],
  },
  detail: {
    type: String,
    required: [true, "Detail alamat wajib diisi"],
    maxlength: [255, "Panjang maksimal detail alamat adalah 255 karakter"],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
}, {timestamps: true});

module.exports = mongoose.model("Delivery-Address", addressSchema);