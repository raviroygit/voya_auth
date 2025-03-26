import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
import config from '../config/config';

// Create a transporter object using Zoho SMTP settings
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure, // true for 465, false for other ports
  auth: {
    user: config.email.user,
    pass: config.email.pass
  }
});

/**
 * Render an EJS template from the templates folder.
 * @param templateName - Template filename (e.g., 'magicLink.ejs')
 * @param data - Data to be passed to the template
 * @returns Rendered HTML string
 */
async function renderTemplate(templateName: string, data: any): Promise<string> {
  const templatePath = path.join(__dirname, '..', 'templates', templateName);
  return ejs.renderFile(templatePath, data);
}

/**
 * Send an email using Nodemailer.
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param htmlBody - HTML email body
 */
export async function sendEmail(to: string, subject: string, htmlBody: string): Promise<void> {
  try {
    const mailOptions = {
      from: `"No-Reply@Voya" <${config.email.user}>`,
      to,
      subject,
      html: htmlBody
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${info.messageId}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Send a magic link email.
 * @param email - Recipient's email address
 * @param link - Magic link URL
 */
export async function sendMagicLinkEmail(email: string, link: string): Promise<void> {
  const htmlBody = await renderTemplate('magicLink.ejs', {
    link,
    year: new Date().getFullYear()
  });
  const subject = 'Your Verification Link - Complete Your Registration';
  await sendEmail(email, subject, htmlBody);
}

/**
 * Send an OTP email.
 * @param email - Recipient's email address
 * @param otp - One-time password code
 */
export async function sendOTPEmail(email: string, otp: string): Promise<void> {
  const htmlBody = await renderTemplate('otp.ejs', {
    otp,
    year: new Date().getFullYear()
  });
  const subject = 'Your One-Time Password (OTP)';
  await sendEmail(email, subject, htmlBody);
}
