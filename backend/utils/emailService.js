import nodemailer from 'nodemailer';

// The transporter will be created lazily when sendEmail is called.
// This prevents issues where this file is imported before dotenv.config() runs.
let transporter = null;

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plaintext body
 * @param {string} [options.html] - HTML body
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
      port: parseInt(process.env.SMTP_PORT || '2525'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER, 
        pass: process.env.SMTP_PASS,
      },
    });
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"SocietySphere" <noreply@societysphere.com>',
      to,
      subject,
      text,
      html: html || text, // Fallback to text if html is not provided
    });
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Error sending email: ${error.message}`);
    // We don't throw to prevent stopping the main request flow if email fails
    return null; 
  }
};
