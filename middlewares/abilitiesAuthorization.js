const definaAbilityFor = require("../utils/roleAbilities");

function abilitiesAuthorization(action = "", subject = "") {
  return function(req, res, next) {
    const abilities = definaAbilityFor(req.user);

    if (abilities.can(action, subject)) {
      next();
    } else {
      return res.status(403).json({
        code: 403,
        error: "Forbidden",
        message: `Anda tidak memiliki akses ${action} untuk ${subject}`,
      });
    }
  }
}

module.exports = abilitiesAuthorization;