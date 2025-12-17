// tests/mocks/authMiddlewareMock.js
module.exports = (req, res, next) => {
  req.user = { _id: "mock-user-id", role: "user" }; // or "admin"/"vendor" depending on the test
  next();
};
