require("dotenv").config();

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = async (email, subject, body) => {
  const mailData = await transporter.sendMail({
    from: process.env.EMAIL_ADDRESS,
    to: email,
    subject: subject,
    text: body,
  });

  console.log(`Email sent with ID:  ${mailData.messageId}`);
};

module.exports = sendEmail;
