// src/utils/mailService.ts
import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
import fs from 'fs/promises';
import { MailOptions, TemplateData } from '../models/inerfaces/index';

const mailConfig = {
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.MAIL_PORT || '587'),
  secure: process.env.MAIL_SECURE === 'true',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
  from: {
    name: process.env.MAIL_FROM_NAME || 'Your App Name',
    address: process.env.MAIL_FROM_ADDRESS || 'noreply@yourapp.com',
  },
};

// Create transporter instance
const transporter = nodemailer.createTransport({
  host: mailConfig.host,
  port: mailConfig.port,
  secure: mailConfig.secure,
  auth: mailConfig.auth,
});

// Templates path
const templatesPath = path.join(__dirname, '../templates/emails');

// Verify mail connection
export const verifyMailConnection = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    console.log('✅ Mail service connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Mail service connection failed:', error);
    return false;
  }
};

// Load email template
const loadTemplate = async (templateName: string): Promise<string> => {
  try {
    const templatePath = path.join(templatesPath, `${templateName}.ejs`);
    const template = await fs.readFile(templatePath, 'utf-8');
    return template;
  } catch (error) {
    throw new Error(`Template ${templateName} not found`);
  }
};

// Render template with data
const renderTemplate = async (templateName: string, data: TemplateData): Promise<string> => {
  try {
    const template = await loadTemplate(templateName);
    return ejs.render(template, data);
  } catch (error) {
    console.error('Template rendering error:', error);
    throw error;
  }
};

// Main send mail function
export const sendMail = async (options: MailOptions): Promise<boolean> => {
  try {
    let htmlContent = options.html;

    // If template is specified, render it
    if (options.template && options.data) {
      htmlContent = await renderTemplate(options.template, options.data);
    }

    const mailOptions = {
      from: `${mailConfig.from.name} <${mailConfig.from.address}>`,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: htmlContent,
      text: options.text,
      attachments: options.attachments,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return false;
  }
};

// Send welcome email
export const sendWelcomeEmail = async (to: string, userData: { name: string; email: string }): Promise<boolean> => {
  return sendMail({
    to,
    subject: 'Welcome to Our Platform!',
    template: 'welcome',
    data: userData,
  });
};

// Send verification email
export const sendVerificationEmail = async (to: string, verifyData: { name: string; code: string }): Promise<boolean> => {
  return sendMail({
    to,
    subject: 'Verify Your Email Address',
    template: 'email-verification',
    data: verifyData,
  });
};

// Send forgot password code
export const sendForgotPasswordCode = async (to: string, forgotData: { name: string; code: string }): Promise<boolean> => {
  return sendMail({
    to,
    subject: 'Password Reset Code',
    template: 'forgot-password',
    data: forgotData,
  });
};

// Send password reset confirmation
export const sendPasswordResetConfirmation = async (to: string, userData: { name: string; email: string }): Promise<boolean> => {
  return sendMail({
    to,
    subject: 'Password Successfully Reset',
    template: 'reset-password-confirmation',
    data: userData,
  });
};

// Send custom template email
export const sendTemplateEmail = async (to: string, subject: string, templateName: string, data: TemplateData): Promise<boolean> => {
  return sendMail({
    to,
    subject,
    template: templateName,
    data,
  });
};

// Send simple HTML email
export const sendHtmlEmail = async (to: string, subject: string, htmlContent: string): Promise<boolean> => {
  return sendMail({
    to,
    subject,
    html: htmlContent,
  });
};

// Send bulk emails
export const sendBulkEmails = async (emails: string[], subject: string, template: string, data: TemplateData): Promise<boolean[]> => {
  const results = await Promise.allSettled(
    emails.map(email => 
      sendMail({
        to: email,
        subject,
        template,
        data,
      })
    )
  );

  return results.map(result => result.status === 'fulfilled' ? result.value : false);
};
