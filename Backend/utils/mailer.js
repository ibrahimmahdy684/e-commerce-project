const nodemailer = require("nodemailer");

// Default email style for consistent branding
const defaultEmailStyle = `
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .email-container {
      background-color: #f9f9f9;
      border-radius: 8px;
      padding: 30px;
      border: 1px solid #e0e0e0;
    }
    h2 {
      color: #2563eb;
      margin-top: 0;
    }
    .otp-code {
      background-color: #2563eb;
      color: white;
      padding: 15px 30px;
      font-size: 24px;
      font-weight: bold;
      letter-spacing: 3px;
      border-radius: 5px;
      display: inline-block;
      margin: 20px 0;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      font-size: 12px;
      color: #666;
    }
  </style>
`;

// Get email configuration from environment variables
const GMAIL_EMAIL = process.env.GMAIL_EMAIL || "teckitify@gmail.com";
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || "";

// Debug logging
console.log("📧 Email Configuration:");
console.log("  GMAIL_EMAIL:", GMAIL_EMAIL);
console.log("  GMAIL_APP_PASSWORD:", GMAIL_APP_PASSWORD ? `${GMAIL_APP_PASSWORD.substring(0, 4)}****` : "(not set)");

// Create transporter with Gmail configuration
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // use SSL
  auth: {
    user: GMAIL_EMAIL,
    pass: GMAIL_APP_PASSWORD,
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  debug: process.env.NODE_ENV === "development",
  logger: process.env.NODE_ENV === "development",
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email transporter verification failed:", error.message);
    console.error("Please check your GMAIL_EMAIL and GMAIL_APP_PASSWORD environment variables");
  } else {
    console.log("✅ Email server is ready to send messages");
  }
});

/**
 * Send an email using the configured transporter
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content of the email
 * @returns {Promise<Object>} - Result of sending email
 */
const sendEmail = async ({ to, subject, html }) => {
  // Check if email sending is disabled in development
  const USE_EMAIL = process.env.USE_EMAIL !== "false";

  if (!USE_EMAIL) {
    console.log("📧 Email sending is disabled (USE_EMAIL=false)");
    console.log("Would have sent email to:", to);
    console.log("Subject:", subject);
    return { success: true, messageId: "dev-mode-disabled" };
  }

  // Check if credentials are configured
  if (!GMAIL_APP_PASSWORD) {
    console.error("❌ GMAIL_APP_PASSWORD is not configured");
    throw new Error("Email credentials not configured");
  }

  try {
    const info = await transporter.sendMail({
      from: `"E-commerce Store" <${GMAIL_EMAIL}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Failed to send email:", error.message);
    throw error;
  }
};

/**
 * Send verification OTP email
 * @param {string} email - Recipient email
 * @param {number} otp - OTP code
 * @returns {Promise<Object>}
 */
const sendVerificationEmail = async (email, otp) => {
  const html = `
    ${defaultEmailStyle}
    <div class="email-container">
      <h2>Email Verification</h2>
      <p>Thank you for registering with our E-commerce Store!</p>
      <p>Please use the following OTP code to verify your email address:</p>
      <div style="text-align: center;">
        <span class="otp-code">${otp}</span>
      </div>
      <p><strong>This code is valid for 10 minutes.</strong></p>
      <p>If you did not request this verification, please ignore this email.</p>
      <div class="footer">
        <p>This is an automated message, please do not reply to this email.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Email Verification - E-commerce Store",
    html,
  });
};

/**
 * Send welcome email after successful verification
 * @param {string} email - Recipient email
 * @param {string} name - User's name
 * @returns {Promise<Object>}
 */
const sendWelcomeEmail = async (email, name) => {
  const html = `
    ${defaultEmailStyle}
    <div class="email-container">
      <h2>Welcome to E-commerce Store!</h2>
      <p>Hello ${name},</p>
      <p>Your account has been successfully verified and activated.</p>
      <p>You can now log in and start exploring our products!</p>
      <p>Thank you for joining us.</p>
      <div class="footer">
        <p>This is an automated message, please do not reply to this email.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Welcome to E-commerce Store!",
    html,
  });
};

/**
 * Send password reset OTP email
 * @param {string} email - Recipient email
 * @param {number} otp - OTP code
 * @returns {Promise<Object>}
 */
const sendPasswordResetEmail = async (email, otp) => {
  const html = `
    ${defaultEmailStyle}
    <div class="email-container">
      <h2>Password Reset Request</h2>
      <p>We received a request to reset your password.</p>
      <p>Please use the following OTP code to reset your password:</p>
      <div style="text-align: center;">
        <span class="otp-code">${otp}</span>
      </div>
      <p><strong>This code is valid for 10 minutes.</strong></p>
      <p>If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>
      <div class="footer">
        <p>This is an automated message, please do not reply to this email.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Password Reset - E-commerce Store",
    html,
  });
};

module.exports = {
  transporter,
  sendEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  defaultEmailStyle,
};
