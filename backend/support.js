const nodemailer = require("nodemailer");
const rateLimit = require("express-rate-limit");
require("dotenv").config();
const validator = require("validator");
const dns = require("dns");
const { z } = require("zod");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const emailIpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  message: "Too many attempts. Please try again in 15 minutes.",
  skip: (req) => {
    const whitelist = ["84.43.144.178", "::1", "127.0.0.1"];
    return whitelist.includes(req.ip);
  }
});

const verifyEmailDomain = async (email) => {
  try {
    const domain = email.split("@")[1];
    await dns.promises.resolveMx(domain);
    return true;
  } catch (error) {
    console.error("DNS verification failed:", error);
    return false;
  }
};

const contactFormSchema = z.object({
  name: z.string()
    .max(100,"Name must be less than 100 characters!")
    .min(3, "Name must be more than 3 characters!")
    .min(1, "Name is required!")
    .transform(val => validator.escape(val.trim())),
  email: z.string()
    .email("Invalid email address!")
    .min(1, "Email is required!")
    .refine(async (email) => await verifyEmailDomain(email), "Email does not exist or cannot receive emails!"),
  message: z.string()
    .max(3000, "Message must be less than 3000 characters!")
    .min(1, "Message is required!")
    .transform(val => validator.escape(val.trim()))
}).strict();

const sendEmail = async (name, email, message) => {
  try {
    const result = await contactFormSchema.safeParseAsync({ name, email, message });

    if (!result.success) {
      const errors = result.error.issues.map(issue => issue.message);
      throw new Error(errors.join(", "));
    }

    const { name: safeName, email: safeEmail, message: safeMessage } = result.data;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `New Support Message from ${safeName}`,
      text: `Name: ${safeName}\nEmail: ${safeEmail}\nMessage: ${safeMessage}`,
      html: `<p>Name: ${safeName}</p><p>Email: ${safeEmail}</p><p>Message: ${safeMessage}</p>`
    });

    return { status: "success", message: "Message sent successfully!" };
  } 
  catch (error) {
    console.error("Error:", error);
    throw new Error(error.message || "Failed to send message!");
  }
};

module.exports = { sendEmail, emailIpRateLimiter };