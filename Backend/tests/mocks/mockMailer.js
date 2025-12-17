// mocks/mailer.js
module.exports = {
  sendEmail: jest.fn().mockResolvedValue({ success: true, messageId: "test-id" }),
  sendVerificationEmail: jest.fn().mockResolvedValue({ success: true }),
  sendWelcomeEmail: jest.fn().mockResolvedValue({ success: true }),
  sendPasswordResetEmail: jest.fn().mockResolvedValue({ success: true }),
};
