const request = require("supertest");
const mongoose = require("mongoose");
const Product = require("../Models/productModel");
const Category = require("../Models/categoryModel");

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

describe("Cart Module", () => {
  let productId;

  beforeEach(async () => {
    // Need a product to add to cart
    const cat = await Category.create({ name: "General" });
    const prod = await Product.create({
      name: "Cart Item",
      price: 100,
      quantity: 50,
      categoryId: cat._id,
      vendorId: new mongoose.Types.ObjectId(),
      status: "approved"
    });
    productId = prod._id.toString();
  });

  afterEach(() => {
    mockUser = { _id: new mongoose.Types.ObjectId(), role: "user" };
  });

  describe("POST /api/cart", () => {
    it("should add item to cart", async () => {
      const res = await request(app)
        .post("/api/cart")
        .send({
          product_id: productId, 
          quantity: 2
        });
      
      expect(res.statusCode).toBe(201);
      
      expect(res.body.data.cart_id).toBeDefined();
      // Add check via GET
      const getRes = await request(app).get("/api/cart");
      const item = getRes.body.data.items.find(i => i.product_id.toString() === productId);
      expect(item).toBeDefined();
      expect(item.quantity).toBe(2);
    });
  });

  describe("GET /api/cart", () => {
    it("should retrieve user cart", async () => {
      // First add something
      await request(app).post("/api/cart").send({ product_id: productId, quantity: 1 });

      const res = await request(app).get("/api/cart");
      expect(res.statusCode).toBe(200);
      expect(res.body.data.items.length).toBeGreaterThan(0);
    });
  });

  describe("PUT /api/cart/:item_id", () => {
    it("should update cart item quantity", async () => {
       // First add something
       const addRes = await request(app).post("/api/cart").send({ product_id: productId, quantity: 1 });
       
       // get item id from cart
       const getCart = await request(app).get("/api/cart");
       const itemId = getCart.body.data.items.find(i => i.product_id.toString() === productId)._id;

       const res = await request(app)
         .put(`/api/cart/${itemId}`) // Cart routes usually update by item ID or product ID
         .send({ quantity: 5 });

       expect(res.statusCode).toBe(200);
       // Re-fetch cart to check update if PUT doesn't return items, 
       // but typically we might check response message or re-fetch.
       // UpdateCartItem returns null data.
       const checkRes = await request(app).get("/api/cart");
       const updatedItem = checkRes.body.data.items.find(i => i._id.toString() === itemId.toString());
       expect(updatedItem.quantity).toBe(5);
    });
  });

  describe("DELETE /api/cart/:item_id", () => {
    it("should remove item from cart", async () => {
      // First add something
      await request(app).post("/api/cart").send({ product_id: productId, quantity: 1 });
      
      const getCart = await request(app).get("/api/cart");
      const itemId = getCart.body.data.items.find(i => i.product_id.toString() === productId)._id;

      const res = await request(app).delete(`/api/cart/${itemId}`);
      
      expect(res.statusCode).toBe(200);
      
      const checkRes = await request(app).get("/api/cart");
      const deletedItem = checkRes.body.data.items.find(i => i._id.toString() === itemId.toString());
      expect(deletedItem).toBeUndefined();
    });
  });
  
  describe("DELETE /api/cart", () => {
    it("should clear the cart", async () => {
      const postRes = await request(app).post("/api/cart").send({ product_id: productId, quantity: 1 });
      
      const res = await request(app).delete("/api/cart");
      expect(res.statusCode).toBe(200);
      
      const checkRes = await request(app).get("/api/cart");
      expect(checkRes.body.data.items.length).toBe(0);
    });
  });

});
