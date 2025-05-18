const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController.js");

router.use((req, res, next) => {
  console.log(`Auth API Request: ${req.method} ${req.originalUrl}`);
  next();
});

router.post("/check-email", authController.emailCheckLimiter, authController.checkEmail);
router.post("/register", authController.verifyEmailVerificationCode, authController.register);
router.post("/login", authController.verifyEmailVerificationCode, authController.login);
router.post("/username-check", authController.checkUsername);
router.get("/user", authController.getUser);

module.exports = router;