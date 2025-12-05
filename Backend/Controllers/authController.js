const User = require("../Models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
} = require("../utils/mailer");



const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};


const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};


const comparePassword = async (password, hashed) => {
  return await bcrypt.compare(password, hashed);
};


const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
};


const registerUser = async (req, res) => {
  try {
    console.log("📝 Register request received");
    console.log("Request body:", req.body);

    const { name, email, password, role, phone, address } = req.body;

    console.log("Checking for existing user:", email);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists:", email);
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = await hashPassword(password);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: role || "user",
      phone,
      address,
      vendor_status: role === "vendor" ? "not-approved" : undefined,
    });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    // Try to send verification email, but don't fail registration if email fails
    let emailSent = true;
    try {
      await sendVerificationEmail(email, otp);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError.message);
      emailSent = false;
    }

    const message = emailSent
      ? "User registered. Check email for OTP."
      : "User registered, but email could not be sent. Please contact support for OTP.";

    console.log("✅ Registration successful:", { email, emailSent });
    res.status(201).json({
      message,
      emailSent,
      ...(process.env.NODE_ENV === "development" && !emailSent ? { otp } : {})
    });

  } catch (e) {
    console.error("❌ Registration error:", e);
    console.error("Error stack:", e.stack);
    res.status(500).json({ message: "Server error", error: e.message });
  }
};


const verifyRegistration = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (user.otpExpires < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    user.otp = undefined;
    user.otpExpires = undefined;
    user.isVerified = true;
    await user.save();

    // Try to send welcome email, but don't fail verification if email fails
    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError.message);
    }

    res.status(200).json({ message: "Account verified successfully" });

  } catch (e) {
    res.status(500).json({ message: "Server error", error: e.message });
  }
};


const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const match = await comparePassword(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = generateToken(user);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (e) {
    res.status(500).json({ message: "Server error", error: e.message });
  }
};


const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    // Try to send password reset email, but don't fail if email fails
    let emailSent = true;
    try {
      await sendPasswordResetEmail(email, otp);
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError.message);
      emailSent = false;
    }

    const message = emailSent
      ? "OTP sent to your email"
      : "OTP generated, but email could not be sent. Please contact support.";

    res.status(200).json({
      message,
      emailSent,
      ...(process.env.NODE_ENV === "development" && !emailSent ? { otp } : {})
    });

  } catch (e) {
    res.status(500).json({ message: "Server error", error: e.message });
  }
};


const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (user.otpExpires < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    res.status(200).json({ message: "OTP verified" });

  } catch (e) {
    res.status(500).json({ message: "Server error", error: e.message });
  }
};


const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const hashed = await hashPassword(newPassword);
    user.password = hashed;

    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successful" });

  } catch (e) {
    res.status(500).json({ message: "Server error", error: e.message });
  }
};


module.exports = {
  registerUser,
  verifyRegistration,
  loginUser,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
};
