const request = require("supertest");
const app = require("../app");
const Category = require("../Models/CategoryModel");
const mongoose = require("mongoose");

const mockAdminId = new mongoose.Types.ObjectId();

// Mock auth middleware to always be an admin
jest.mock("../Middleware/authMiddleware.js", () => {
  return (req, res, next) => {
    req.user = { _id: mockAdminId, role: "admin" };
    next();
  };
});

describe("Category Module", () => {
  afterEach(async () => {
    await Category.deleteMany({});
  });

  it("should create a category", async () => {
    const res = await request(app)
      .post("/categories")   // fixed path
      .send({ name: "Electronics" });

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe("Electronics");
  });

  it("should get all categories", async () => {
    await Category.create({ name: "Books" });

    const res = await request(app)
      .get("/categories");  // fixed path

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty("name");
  });
});
