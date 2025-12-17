const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

// ---- In-memory MongoDB setup ----
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri, {
    dbName: "test-db", // optional: name your test database
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  // Clean all collections after each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

// ---- Mock email functions ----
jest.mock("../utils/mailer.js", () => ({
  sendEmail: jest.fn().mockResolvedValue({ success: true, messageId: "test-id" }),
  sendVerificationEmail: jest.fn().mockResolvedValue({ success: true }),
  sendWelcomeEmail: jest.fn().mockResolvedValue({ success: true }),
  sendPasswordResetEmail: jest.fn().mockResolvedValue({ success: true }),
}));
