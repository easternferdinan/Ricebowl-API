const jwt = require("jsonwebtoken");
const Users = require("../app/users/usersModel");
const getToken = require("../utils/getToken");
const { secretKey } = require("../config/config");

function decodeToken() {
  return async function(req, res, next) {
    try {
      const token = getToken(req);
      if (!token) {
        return next();
      }

      req.user = jwt.verify(token, secretKey);
      req.user.token = token;

      const user = await Users.findOne({token: {$in: [token]}});

      if (!user) {
        return res.json({
          code: 401,
          error: "Unauthorized",
          message: "Token expired",
        })
      }
    } catch (error) {
      return res.status(500).json(error);
    }

    return next();

  }
}

module.exports = decodeToken;