const { Router } = require("express");
const router = Router();
const controller = require("../controllers/authcontroller");
const {
  user,
  password,
  email,
  resetToken,
  fullname,
} = require("../middlewares/validation");
const auth = require("../middlewares/auth");
const passport = require("../config/passport");

router.route("/signup").post([user, password], controller.signup);
router.route("/signin").post([email, password], controller.signin);
router.route("/refresh").get(controller.refresh);
router.route("/logout").post(controller.LogOut);
router.route("/verify/:id").patch(controller.verify);
router.route("/verify").post(controller.resendVerificationemail);

router
  .route("/forgot_password")
  .post([email], controller.forgotPassword)
  .patch([resetToken, password], controller.resetPassword);
router
  .route("/google")
  .get(passport.authenticate("google", { scope: ["profile", "email"] }));
router.route("/google/callback").post(auth.googleOauth);
router
  .route("/twitter")
  .get(passport.authenticate("twitter", { scope: ["profile"] }));
router.route("/twitter/callback").post(auth.twitterOauth);
router.route("/facebook").get(passport.authenticate("facebook"));
router.route("/facebook/callback").post(auth.facebookOauth);
router
  .route("/waitlist")
  .post([user, fullname, password], controller.addWaitlist)
  .patch(controller.updateWaitlistDetails);

module.exports = router;
