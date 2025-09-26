import nodemailer from "nodemailer";

// Tạo transporter cho Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTP = (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER, // Địa chỉ email gửi
    to: email, // Địa chỉ email nhận OTP
    subject: "Your OTP for password reset", // Tiêu đề email
    text: `Your OTP for resetting the password is: ${otp}`, // Nội dung email
  };

  return transporter.sendMail(mailOptions);
};
