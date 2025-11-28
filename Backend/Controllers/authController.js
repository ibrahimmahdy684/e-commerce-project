import User from "../Models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";


export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};


export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// 3. Compare Password

export const comparePassword = async (password, hashed) => {
  return await bcrypt.compare(password, hashed);
};


// 4. Generate OTP

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000); // 6 digits
};


// 5. Email Transporter

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 6. Send Verification Email

export const sendVerificationEmail = async (email, otp) => {
  await transporter.sendMail({
    from: `"E-commerce Store" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your Email",
    html: `
      <h2>Email Verification</h2>
      <p>Your OTP code is: <b>${otp}</b></p>
      <p>This code is valid for 10 minutes.</p>
    `,
  });
};

// 7. Send Welcome Email

export const sendWelcomeEmail = async (email, name) => {
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


// 8. REGISTER USER (with OTP)

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;

    // check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ msg: "Email already exists" });

    // hash password
    const hashedPassword = await hashPassword(password);

    // create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
      phone,
      address,
      vendor_status: role === "vendor" ? "not-approved" : undefined,
    });

    // generate OTP
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // send email
    await sendVerificationEmail(email, otp);

    res.status(201).json({
      msg: "User registered. Check your email for OTP verification.",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// =====================================
// 9. VERIFY REGISTRATION

export const verifyRegistration = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (user.otp !== otp)
      return res.status(400).json({ msg: "Invalid OTP" });

    if (user.otpExpires < Date.now())
      return res.status(400).json({ msg: "OTP expired" });

    // activate user
    user.otp = undefined;
    user.otpExpires = undefined;
    user.isVerified = true;
    await user.save();

    // send welcome email
    await sendWelcomeEmail(user.email, user.name);

    res.json({ msg: "Registration verified successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// =====================================
// 10. LOGIN
// =====================================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ msg: "Invalid email or password" });

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch)
      return res.status(400).json({ msg: "Invalid email or password" });

    const token = generateToken(user);

    res.json({
      msg: "Login successful",
      token,
      user: {
        name: user.name,
        role: user.role,
        email: user.email,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
};
