const mongoose = require("mongoose");
const { Schema, model} = mongoose
const bcrypt = require("bcrypt");

const userSchema = Schema({
  full_name: {
    type: String,
    required: [true, "Nama tidak boleh kosong"],
    maxlength: [255, "Panjang nama harus antara 3 - 255 karakter"],
    minlength: [3, "Panjang nama harus antara 3 - 255 karakter"],
  },
  email: {
    type: String,
    required: [true, "Email tidak boleh kosong"],
    maxlength: [255, "Panjang email maksimal 255 karakter"],
  },
  password: {
    type: String,
    required: [true, "Password tidak boleh kosong"],
    maxlength: [24, "Panjang maksimal password 24 karakter"],
    minlength: [8, "Panjang minimal password 8 karakter"],
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  token: [String],
}, { timestamps: true });

userSchema.path("email").validate(value => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(value), "Email `{VALUE}` tidak valid");

userSchema.path("email").validate(async function(value) {
  try {
    const count = await this.model("User").count({email: value});
    return !count;
  } catch (error) {
    console.log(error);
  }
});

const HASH_ROUND = 10;
userSchema.pre("save", function (next) {
  this.password = bcrypt.hashSync(this.password, HASH_ROUND);
  next();
});

module.exports = model("User", userSchema);