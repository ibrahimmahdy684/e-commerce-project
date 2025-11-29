const User = require("../Models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");



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


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


const sendVerificationEmail = async (email, otp) => {
  await transporter.sendMail({
    from: `"E-commerce Store" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Email Verification",
    html: `
      <h2>Email Verification</h2>
      <p>Your OTP code is: <b>${otp}</b></p>
      <p>This code is valid for 10 minutes.</p>
    `,
  });
};


const sendWelcomeEmail = async (email, name) => {
  await transporter.sendMail({
    from: `"E-commerce Store" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Welcome!",
    html: `
      <h2>Welcome, ${name}!</h2>
      <p>Your account has been successfully activated.</p>
    `,
  });
};


const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

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

    await sendVerificationEmail(email, otp);

    res.status(201).json({ message: "User registered. Check email for OTP." });

  } catch (e) {
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

    await sendWelcomeEmail(user.email, user.name);

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

    await sendVerificationEmail(email, otp);

    res.status(200).json({ message: "OTP sent to your email" });

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
