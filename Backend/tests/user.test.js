const request = require("supertest");
const mongoose = require("mongoose");
const User = require("../Models/userModel");

// --- Mocks Setup ---
let mockUser = { _id: new mongoose.Types.ObjectId(), role: "user" };

jest.mock("../Middleware/authMiddleware.js", () => (req, res, next) => {
  req.user = mockUser;
  next();
});

jest.mock("../Middleware/roleMiddleware.js", () => (roles) => (req, res, next) => {
  if (roles.includes(mockUser.role)) {
    next();
  } else {
    res.status(403).json({ message: "Forbidden" });
  }
});

const app = require("../app");

describe("User Module", () => {
  beforeEach(async () => {
    // Ensure the mock user actually exists in the DB if the controller looks it up
    // `getMyProfile` likely does `User.findById(req.user._id)`
    const user = new User({
      _id: mockUser._id,
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      role: "user"
    });
    await user.save();
  });

  afterEach(() => {
    mockUser = { _id: new mongoose.Types.ObjectId(), role: "user" };
  });

  describe("GET /api/users/me", () => {
    it("should retrieve current user profile", async () => {
      mockUser.role = "user";
      const res = await request(app).get("/api/users/me");
      
      expect(res.statusCode).toBe(200);
      expect(res.body.email).toBe("test@example.com");
    });
  });

  describe("PUT /api/users/me", () => {
    it("should update current user profile", async () => {
      mockUser.role = "user";
      const res = await request(app)
        .put("/api/users/me")
        .send({
          name: "Updated Name"
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe("Updated Name");
    });
  });

  describe("GET /api/admin/users", () => {
    it("should return users list for admin", async () => {
      mockUser.role = "admin";
      // We must ensure the admin mock user exists if the controller checks it, 
      // but usually role middleware is enough. 
      // However, let's just make the request.
      
      const res = await request(app).get("/api/admin/users");
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      // Should find at least the user we created in beforeEach
      const found = res.body.find(u => u.email === "test@example.com");
      expect(found).toBeDefined();
    });

    it("should deny access to non-admin", async () => {
      mockUser.role = "user";
      const res = await request(app).get("/api/admin/users");
      expect(res.statusCode).toBe(403);
    });
  });
});
