const { sendEmail, emailIpRateLimiter } = require("../support.js");

const sendMessage = async (req, res) => {
  try {
    const result = await sendEmail(req.body.name, req.body.email, req.body.message);
    res.status(200).json(result);
  } 
  catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

module.exports = {
  emailIpRateLimiter,
  sendMessage
};