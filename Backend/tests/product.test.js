const request = require("supertest");
const mongoose = require("mongoose");
const Category = require("../Models/categoryModel");
const Product = require("../Models/productModel");

// --- Mocks Setup ---
// We'll use a variable to switch the "current user" role dynamically
let mockUser = { _id: new mongoose.Types.ObjectId(), role: "vendor" };

jest.mock("../Middleware/authMiddleware.js", () => (req, res, next) => {
  req.user = mockUser;
  next();
});

jest.mock("../Middleware/roleMiddleware.js", () => (roles) => (req, res, next) => {
  // If the user's role is in the allowed list, proceed
  if (roles.includes(mockUser.role)) {
    next();
  } else {
    res.status(403).json({ message: "Forbidden" });
  }
});

// Import app AFTER mocks
const app = require("../app");

describe("Product Module", () => {
  let categoryId;
  let productId;

  beforeEach(async () => {
    // Creating a dummy category for product association
    const cat = await Category.create({
      name: "Electronics",
      description: "Gadgets",
    });
    categoryId = cat._id;
  });

  afterEach(() => {
    // Reset mock user to vendor for safety
    mockUser = { _id: new mongoose.Types.ObjectId(), role: "vendor" };
  });

  describe("POST /api/product", () => {
    it("should create a product as a vendor", async () => {
      mockUser.role = "vendor";
      
      const res = await request(app)
        .post("/api/product")
        .send({
          name: "Laptop",
          description: "High performance",
          categoryId: categoryId,
          vendorId: mockUser._id,
          price: 1500,
          quantity: 10,
        });

      if (res.statusCode !== 201) {
        console.log("Create Product Failed:", res.statusCode, res.body);
      }

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("name", "Laptop");
      productId = res.body._id; // Save for later tests if sequential, but better to rely on atomic tests
    });

    it("should fail validation if price is missing", async () => {
      mockUser.role = "vendor";
      const res = await request(app)
        .post("/api/product")
        .send({
          name: "No Price Product",
          categoryId: categoryId,
        });
      expect(res.statusCode).toBe(400); // Assuming controller returns 400 for validation
    });
  });

  describe("GET /api/product/:id", () => {
    it("should get a product by ID (public)", async () => {
      // Create a product in DB first
      const product = await Product.create({
        name: "Screen",
        description: "4K",
        categoryId: categoryId,
        vendorId: mockUser._id,
        price: 300,
        quantity: 5,
        status: "approved"
      });

      const res = await request(app).get(`/api/product/${product._id}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe("Screen");
    });
  });

  describe("PUT /api/product/:id", () => {
    it("should update a product as vendor", async () => {
      mockUser.role = "vendor";
      const product = await Product.create({
        name: "Old Laptop",
        categoryId: categoryId,
        vendorId: mockUser._id, // Must match the mock user for ownership check if implemented
        price: 1000,
      });

      const res = await request(app)
        .put(`/api/product/${product._id}`)
        .send({
          name: "New Laptop",
          price: 1200
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe("New Laptop");
      expect(res.body.price).toBe(1200);
    });
  });

  describe("DELETE /api/product/:id", () => {
    it("should delete a product as admin", async () => {
      // Create product
      const product = await Product.create({
        name: "To Delete",
        categoryId: categoryId,
        vendorId: new mongoose.Types.ObjectId(), // Someone else's product
        price: 50,
      });

      // Switch to Admin
      mockUser.role = "admin";
      mockUser._id = new mongoose.Types.ObjectId();

      const res = await request(app).delete(`/api/product/${product._id}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/deleted/i);

      const check = await Product.findById(product._id);
      expect(check).toBeNull();
    });
  });
});
