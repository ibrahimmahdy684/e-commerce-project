// controllers/userController.js
const User = require("../Models/userModel");

// -----------------------------------------------------------
// USER (ROLE: user)
// -----------------------------------------------------------

// GET /users/me
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /users/me
const updateMyProfile = async (req, res) => {
  try {
    const forbidden = ["email", "role", "vendor_status"];
    forbidden.forEach((f) => delete req.body[f]);

    const updated = await User.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
    }).select("-password");

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /users/me
const deleteMyAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: "Account deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /vendors/approved
const getAllApprovedVendors = async (req, res) => {
  try {
    const vendors = await User.find({
      role: "vendor",
      vendor_status: "approved",
    }).select("-password");

    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /vendors?name=...
const getVendorByName = async (req, res) => {
  try {
    const name = req.query.name;
    const vendors = await User.find({
      role: "vendor",
      shop_name: { $regex: name, $options: "i" },
    }).select("-password");

    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// -----------------------------------------------------------
// VENDOR (ROLE: vendor)
// -----------------------------------------------------------

// GET /vendor/me
const getMyVendorProfile = async (req, res) => {
  try {
    const vendor = await User.findById(req.user._id).select("-password");
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /vendor/me — any update sets status back to not-approved
const updateVendorProfile = async (req, res) => {
  try {
    ["role", "email", "vendor_status"].forEach((f) => delete req.body[f]);

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { ...req.body, vendor_status: "not-approved" },
      { new: true }
    ).select("-password");

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /vendor/status
const getVendorStatus = async (req, res) => {
  try {
    const vendor = await User.findById(req.user._id);
    res.json({ vendor_status: vendor.vendor_status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// -----------------------------------------------------------
// ADMIN (ROLE: admin)
// -----------------------------------------------------------

// GET /admin/vendors/unapproved
const getUnapprovedVendors = async (req, res) => {
  try {
    const vendors = await User.find({
      role: "vendor",
      vendor_status: "not-approved",
    }).select("-password");

    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /admin/vendors/:id/approve
const approveVendor = async (req, res) => {
  try {
    const vendor = await User.findByIdAndUpdate(
      req.params.id,
      { vendor_status: "approved" },
      { new: true }
    ).select("-password");

    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /admin/create
const createUserByAdmin = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /admin/users?role=user/vendor/admin
const getAllUsers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;

    const users = await User.find(filter).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /admin/users/:id
const adminUpdateUser = async (req, res) => {
  try {
    delete req.body.password;

    const updated = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).select("-password");

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /admin/users/:id
const adminDeleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  deleteMyAccount,
  getAllApprovedVendors,
  getVendorByName,
  getMyVendorProfile,
  updateVendorProfile,
  getVendorStatus,
  approveVendor,
  createUserByAdmin,
  getUnapprovedVendors,
  getAllUsers,
  adminUpdateUser,
  adminDeleteUser,
};
