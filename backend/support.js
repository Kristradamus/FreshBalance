const nodemailer = require('nodemailer');
require('dotenv').config();
const validator = require('validator');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (name, email, message) => {
  const errors = [];
  if (!name || !email || !message) {
    errors.push('All fields are required!');
  }
  if (email && !validator.isEmail(email)){
    errors.push('Invalid email address!');
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