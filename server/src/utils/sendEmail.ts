import nodemailer from "nodemailer";
import config from "config";

const userEmail: string = config.get<string>("EMAIL");
const userPassword: string = config.get<string>("Password");

console.log(userEmail, userPassword);

async function sendEmail(emailData: {
  to: string;
  text?: string;
  html?: string;
  subject: string;
}): Promise<void> {
  try {
    if (!userEmail || !userPassword) {
      throw new Error("Missing EMAIL or Password in config.");
    }

    let transporter = await nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: userEmail,
        pass: userPassword,
      },
    });

    let info = await transporter.sendMail({
      from: `"Syed Omer Ali" <${userEmail}>`,
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html,
    });

    console.log(`Email send successfully to ${emailData.to} : ${info.messageId}`)
  } catch (error) {
    console.log(error);
  }
}

export default sendEmail;
