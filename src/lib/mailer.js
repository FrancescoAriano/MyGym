import nodemailer from "nodemailer";
import { Resend } from "resend";

// Resend configuration for production
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;
const isProduction = process.env.NODE_ENV === "production";

// Ethereal helper function for development
const getEtherealCredentials = async () => {
  if (!global.etherealTestAccount) {
    global.etherealTestAccount = await nodemailer.createTestAccount();
  }
  return global.etherealTestAccount;
};

// Generic helper function that decides which service to use
async function sendEmail(options) {
  if (isProduction && resend) {
    // Resend email sending logic
    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      console.log(`Production email sent to ${options.to} via Resend.`);
      return { success: true };
    } catch (error) {
      console.error("Error sending email with Resend:", error);
      return { success: false, error: "Failed to send production email" };
    }
  } else {
    // Ethereal email sending logic for development
    try {
      const testAccount = await getEtherealCredentials();
      const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || "MyGym Dev <dev@example.com>",
        ...options,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`Development email sent. Preview URL: ${previewUrl}`);
      return { success: true, previewUrl };
    } catch (error) {
      console.error("Error sending development email with Ethereal:", error);
      return { success: false, error: "Failed to send development email" };
    }
  }
}

export const sendGymVerificationEmail = async (to, token) => {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/gym/verify-email?token=${token}`;
  return sendEmail({
    to,
    subject: "[MyGym] Verify Your Email Address",
    html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Welcome to MyGym!</h2>
                <p>Thank you for registering your gym. Please click the button below to verify your email address.</p>
                <p>This link is valid for 24 hours.</p>
                <a href="${verificationUrl}" 
                   style="display: inline-block; padding: 12px 24px; margin: 20px 0; font-size: 16px; color: white; background-color: #4f46e5; text-decoration: none; border-radius: 5px;">
                   Verify Email Address
                </a>
                <p>If you did not register for a MyGym account, please ignore this email.</p>
            </div>
        `,
  });
};

export const sendOnboardingEmail = async (to, token) => {
  const onboardingUrl = `${process.env.NEXTAUTH_URL}/user/set-password?token=${token}`;
  return sendEmail({
    to,
    subject: "Welcome to MyGym! Set up your account",
    html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Welcome to the Gym!</h2>
                <p>Your account has been created. Please click the link below to set your password and activate your account.</p>
                <p>This link will expire in 72 hours.</p>
                <a href="${onboardingUrl}" 
                   style="display: inline-block; padding: 12px 24px; margin: 20px 0; font-size: 16px; color: white; background-color: #4f46e5; text-decoration: none; border-radius: 5px;">
                   Set Your Password
                </a>
            </div>
        `,
  });
};

export const sendPasswordResetEmail = async (to, token) => {
  const resetUrl = `${process.env.NEXTAUTH_URL}/set-password?token=${token}`;
  return sendEmail({
    to,
    subject: "[MyGym] Password Reset Request",
    html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Password Reset</h2>
                <p>You requested a password reset. Click the link below to set a new password.</p>
                <p>This link is valid for 1 hour.</p>
                <a href="${resetUrl}" 
                   style="display: inline-block; padding: 12px 24px; margin: 20px 0; font-size: 16px; color: white; background-color: #4f46e5; text-decoration: none; border-radius: 5px;">
                   Reset Password
                </a>
                <p>If you did not request this, please ignore this email.</p>
            </div>
        `,
  });
};

export const sendAdminGymRegistrationNotification = async (gymData) => {
  return sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: `[MyGym] New Gym Registration for Approval: ${gymData.name}`,
    html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h1>New Gym Registration Pending Approval</h1>
                <p>A new gym has verified their email and is waiting for your approval.</p>
                <ul>
                    <li><strong>ID:</strong> ${gymData.id}</li>
                    <li><strong>Name:</strong> ${gymData.name}</li>
                    <li><strong>Email:</strong> ${gymData.email}</li>
                    <li><strong>Address:</strong> ${gymData.address}</li>
                </ul>
                <p>Please go to your database or admin panel to approve this gym.</p>
            </div>
        `,
  });
};
