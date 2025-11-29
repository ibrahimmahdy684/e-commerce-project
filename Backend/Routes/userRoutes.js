// routes/userRoutes.js

const express = require("express");
const router = express.Router();

const {
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
} = require("../Controllers/userController.js");
const protect = require("../Middleware/authMiddleware.js");
const allowRoles = require("../Middleware/roleMiddleware.js");


/* ----------------------------------------------------------
   USER ROUTES (role = user)
---------------------------------------------------------- */

router.get("/users/me", protect, allowRoles("user"), getMyProfile);
router.put("/users/me", protect, allowRoles("user"), updateMyProfile);
router.delete("/users/me", protect, allowRoles("user"), deleteMyAccount);

router.get(
  "/vendors/approved",
  protect,
  allowRoles("user", "vendor", "admin"),
  getAllApprovedVendors
);

router.get(
  "/vendors",
  protect,
  allowRoles("user", "vendor", "admin"),
  getVendorByName
);

/* ----------------------------------------------------------
   VENDOR ROUTES (role = vendor)
---------------------------------------------------------- */

router.get("/vendor/me", protect, allowRoles("vendor"), getMyVendorProfile);
router.put("/vendor/me", protect, allowRoles("vendor"), updateVendorProfile);
router.get("/vendor/status", protect, allowRoles("vendor"), getVendorStatus);

/* ----------------------------------------------------------
   ADMIN ROUTES (role = admin)
---------------------------------------------------------- */

router.get(
  "/admin/vendors/unapproved",
  protect,
  allowRoles("admin"),
  getUnapprovedVendors
);

router.put(
  "/admin/vendors/:id/approve",
  protect,
  allowRoles("admin"),
  approveVendor
);

router.post("/admin/create", protect, allowRoles("admin"), createUserByAdmin);

router.get("/admin/users", protect, allowRoles("admin"), getAllUsers);

router.put(
  "/admin/users/:id",
  protect,
  allowRoles("admin"),
  adminUpdateUser
);

router.delete(
  "/admin/users/:id",
  protect,
  allowRoles("admin"),
  adminDeleteUser
);

module.exports = router;
