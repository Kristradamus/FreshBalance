const nodemailer = require("nodemailer");
require("dotenv").config();
const validator = require("validator");
const dns = require("dns");

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const verifyEmailDomain = async (email) => {
  try {
    const domain = email.split('@')[1];
    await dns.promises.resolveMx(domain);
    return true;
  } catch (error) {
    console.error('DNS verification failed:', error);
    return false;
  }
};

const sendEmail = async (name, email, message) => {
  const errors = [];
  if (!name || !email || !message) {
    errors.push('All fields are required!');
  }
  if (email && !validator.isEmail(email)){
    errors.push('Invalid email address!');
  }
  if (email && !await verifyEmailDomain(email)) {
    errors.push('Email domain does not exist or cannot receive emails!');
  }
  if (name && validator.escape(name).length > 100){
    errors.push('Name is too long (max 100 chars)');
  }
  if (message && validator.escape(message).length > 3000)
  { 
    errors.push('Message is too long (max 3000 chars)');
  }

  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `New Support Message from ${validator.escape(name)}`,
      text: `Name: ${validator.escape(name)}\nEmail: ${email}\nMessage: ${validator.escape(message)}`,
      html: `<p>Name: ${validator.escape(name)}</p><p>Email: ${email}</p><p>Message: ${validator.escape(message)}</p>`
    });
    return { status: 'success', message: 'Message sent successfully' };
  }
  catch (error) {
    console.error('Email send error:', error);
    throw new Error('Failed to send message');
  }
};

module.exports = { sendEmail };