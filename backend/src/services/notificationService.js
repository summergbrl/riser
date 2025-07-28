import nodemailer from 'nodemailer';
import twilio from 'twilio';

// Email notification service
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// SMS notification service
let twilioClient = null;
try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }
} catch (error) {
  console.warn('Twilio not configured:', error.message);
}

export async function sendEmailNotification(to, subject, text) {
  try {
    if (!process.env.SMTP_USER) {
      console.log(`Email notification (no SMTP): ${to} - ${subject}`);
      return;
    }
    await emailTransporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      text
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Email error:', error.message);
  }
}

export async function sendSMSNotification(to, message) {
  try {
    if (!twilioClient) {
      console.log(`SMS notification (no Twilio configured): ${to} - ${message}`);
      return;
    }
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    });
    console.log(`SMS sent to ${to}`);
  } catch (error) {
    console.error('SMS error:', error.message);
  }
}

export async function sendPushNotification(userId, title, message) {
  console.log(`Push notification to ${userId}: ${title} - ${message}`);
}
