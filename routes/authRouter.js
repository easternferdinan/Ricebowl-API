const router = require("express").Router();
const usersController = require("../app/auth/usersController");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

passport.use(new LocalStrategy({usernameField: "email"}, usersController.localStrategy));

router.post("/register", usersController.register);
router.post("/login", usersController.login);
router.post("/logout", usersController.logout);

module.exports = router;