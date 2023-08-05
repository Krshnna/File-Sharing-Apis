const nodemailer = require("nodemailer");

exports.sendEmail = async ({ from, to, subject, text, html }) => {
  var transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });
  const mailOptions = {
    from: `Inshare <${from}>`,
    to,
    subject,
    text,
    html,
  };
  await transporter.sendMail(mailOptions);
};
