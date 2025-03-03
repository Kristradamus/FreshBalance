const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service:"gmail",
  auth:{
    user:process.env.EMAIL_USER,
    pass:process.env.EMAIL_PASS,
  }
})
const sendEmail = async(name, email, message) => {
  const mailOptions = {
    from:process.env.EMAIL_USER,
    to:process.env.EMAIL_USER,
    subject:`New Support Message from ${name}`,
    text:`Name: ${name}, \nEmail: ${email}, \nMessage:${message}`
  }
  try{
    await transporter.sendMail(mailOptions);
    return {success: true, message:"Message sent successfully!"};
  }
  catch(error){
    console.error("Error sending email:", error);
    return{success:false, message:`Failed to send message: ${error.message}`};
  }
}
module.exports = {sendEmail};