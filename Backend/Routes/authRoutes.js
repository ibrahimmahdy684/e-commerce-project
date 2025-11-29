const express = require("express");
const {
  registerUser,
  verifyRegistration,
  loginUser,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
} = require("../Controllers/authController.js");

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify", verifyRegistration);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset", verifyResetOTP);   
router.post("/reset-password", resetPassword);

module.exports = router;
