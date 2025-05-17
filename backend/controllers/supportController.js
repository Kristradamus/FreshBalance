const { sendEmail, emailIpRateLimiter } = require("../support.js");

const sendMessage = async (req, res) => {
  console.log("sendMessage function has been called!");
  try {
    const result = await sendEmail(req.body.name, req.body.email, req.body.message);
    res.status(200).json(result);
  } 
  catch (error) {
    console.error("Error sending message: ", error)
    res.status(400).json({
      status: "error",
      message: error.message,
      errorCode: error.errorCode,
    });
  }
};

module.exports = {
  emailIpRateLimiter,
  sendMessage
};