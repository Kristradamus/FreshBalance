const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { sendEmail } = require('./email');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: {/*'http://localhost:5173'*/}`http://192.168.0.156:8080`,
    credentials: true,
  })
);
app.use(bodyParser.json());
app.post('/send-message', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email, and message are required' });
  }
  try {
    const result = await sendEmail(name, email, message);
    if (result.success) {
      res.status(200).json({ message: result.message });
    } else {
      res.status(500).json({ message: result.message });
    }
  } catch (error) {
    console.error('Error in /send-message route:', error);
    res.status(500).json({ message: 'An error occurred while sending the message' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});