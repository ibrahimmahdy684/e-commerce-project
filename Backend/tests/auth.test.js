const request = require("supertest");
const app = require("../app");

describe("Auth Module", () => {
  it("should register a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "test@example.com",
        password: "123456789",
        name: "Test User",
      });

    expect(res.statusCode).toBe(201);

    // Adjust expectations for test environment
    expect(res.body).toHaveProperty(
      "message",
      "User registered, but email could not be sent. Please contact support for OTP."
    );
    expect(res.body).toHaveProperty("emailSent", false);

    // Optional: check OTP and isVerified in test env
    expect(res.body).toHaveProperty("isVerified", true);
    expect(res.body).toHaveProperty("otp");
  });

  it("should login an existing user", async () => {
    // First register
    await request(app)
      .post("/api/auth/register")
      .send({
        email: "login@test.com",
        password: "123456789",
        name: "Login User",
      });

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "login@test.com",
        password: "123456789",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(typeof res.body.token).toBe("string");
  });
});
