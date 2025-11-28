const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  street: { type: String },
  city: { type: String },
  buildingName: { type: String },
  apartmentNo: { type: String },
  description: { type: String },
});

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

  address: addressSchema,

  shop_name: {
    type: String,
  },

  vendor_status: {
    type: String,
    enum: ["approved", "not-approved"],
    default: "not-approved",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
