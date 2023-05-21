const Users = require("../users/usersModel");
const bcrypt = require("bcrypt");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { secretKey } = require("../../config/config");

const register = async (req, res) => {
  try {
    const user = new Users(req.body);
    await user.save();
    return res.json(user);
  } catch(error) {
    if (error && error.name === "ValidationError"){
      return res.status(422).json({
        code: 422,
        error: "Unprocessable entity",
        message: error.message,
        detail: error.errors,
      })
    } else {
      return res.status(500).json(error);
    }
  }
}

const login = (req, res, next) => {
  passport.authenticate("local", async (error, user) => {
    if (error) {
      return res.status(500).json(error);
    }
    if (!user) {
      return res.json({
        code: 401,
        error: "Unauthorized",
        message: "Otentikasi gagal: Email atau password salah",
      });
    }

    const signed = jwt.sign(user, secretKey);

    try {
      await Users.findByIdAndUpdate(user._id, {$push: {token: signed}});
      return res.json({
        message: "Login berhasil",
        user,
        token: signed,
      });
    } catch (error) {
      return res.status(500).json(error);
    }
  })(req, res, next);
}

const logout = async (req, res) => {
  try {
    const user = await Users.findOneAndUpdate({token: {$in: req.user.token}}, {$pull: {token: req.user.token}}, {useFindAndModify: false});
    
    if (!req.user.token || !user) {
      throw error = {
        code: 406,
        error: "Not Acceptable",
        message: "User tidak ditemukan",
      };
    } else {
      return res.json({
        message: "Logout berhasil",
      });
    }    
  } catch (error) {
    return res.status(500).json(error);
  }
}

const localStrategy = async (email, password, done) => {
  try {
    const user = await Users.findOne({email}).select("-__v -createdAt -updatedAt -cart_items -token");
    if (!user) {
      return done();
    }
    if (bcrypt.compareSync(password, user.password)) {
      const {password, ...userWithoutPassword} = user.toJSON();
      return done(null, userWithoutPassword);
    }
  } catch (error) {
    done(error);
  }
  done();
}

module.exports = {
  register,
  login,
  logout,
  localStrategy,
}