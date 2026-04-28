import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Sends a beautifully formatted HTML email to the auction winner.
 */
export const sendWinnerEmail = async (winnerEmail, winnerName, auctionTitle, amount) => {
  // Prevent crash if SMTP is not fully configured
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️ SMTP credentials not found. Skipping winner email to:', winnerEmail);
    return;
  }

  const htmlTemplate = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #0F172A; color: #ffffff; padding: 20px; }
      .container { max-width: 600px; margin: 0 auto; background-color: #1E293B; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); }
      .header { text-align: center; margin-bottom: 30px; }
      .logo { font-size: 24px; font-weight: bold; color: #3B82F6; letter-spacing: 2px; }
      .content { font-size: 16px; line-height: 1.6; color: #94A3B8; }
      .highlight { color: #10B981; font-size: 28px; font-weight: bold; margin: 20px 0; display: block; text-align: center; }
      .btn { display: inline-block; background-color: #3B82F6; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; margin-top: 20px; }
      .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #475569; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">BIDMASTER</div>
      </div>
      <div class="content">
        <h2 style="color: #ffffff; text-align: center;">Congratulations, ${winnerName}! 🏆</h2>
        <p>You have won the auction for <strong>${auctionTitle}</strong>.</p>
        <span class="highlight">$${amount.toLocaleString()}</span>
        <p>To finalize your purchase and arrange delivery, please complete your secure payment immediately.</p>
        <div style="text-align: center;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" class="btn">Complete Payment</a>
        </div>
      </div>
      <div class="footer">
        © ${new Date().getFullYear()} BidMaster Auctions. All rights reserved.<br>
        If you have any questions, reply to this email.
      </div>
    </div>
  </body>
  </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"BidMaster Notifications" <noreply@bidmaster.com>',
      to: winnerEmail,
      subject: `🏆 You won the auction: ${auctionTitle}!`,
      html: htmlTemplate,
    });

    console.log(`📧 Winner email sent to ${winnerEmail} (Message ID: ${info.messageId})`);
  } catch (error) {
    console.error('❌ Failed to send winner email:', error);
  }
};
