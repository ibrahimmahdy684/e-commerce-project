const mongoose = require("mongoose");

// Address sub-schema
const addressSchema = new mongoose.Schema({
  street: { type: String },
  city: { type: String },
  buildingName: { type: String },
  apartmentNo: { type: String },
  description: { type: String },
});

// User schema
const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "vendor", "admin"],
    required: true,
    default: "user",
  },

  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
    minLength: 8,
  },

  points: {
    type: Number,
    default: 0,
    min: 0,
  },

  phone: {
    type: String,
  },

  // Allow address to be either a simple string or an embedded document
  address: {
    type: mongoose.Schema.Types.Mixed,
  },

  shop_name: {
    type: String,
    required: false,
  },

  vendor_status: {
    type: String,
    enum: ["approved", "not-approved"],
    default: "not-approved",
  },

  
  otp: {
    type: String,
  },

  otpExpires: {
    type: Date,
  },

  isVerified: {
    type: Boolean,
    default: false,
  },

  
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


const User = mongoose.model("User", userSchema);
module.exports = User;
