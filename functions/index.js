
const functions = require("firebase-functions");
const admin = require('firebase-admin');
const nodemailer = require("nodemailer");

admin.initializeApp();

/**
 * BFI Security Protocol - SMTP Bridge
 * Transmits OTP codes via verified mail channel for institutional onboarding.
 * Credentials should be managed via environment variables in production.
 */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "security@bharathfilm.com", // Placeholder: use functions.config() or env vars
    pass: "your-app-specific-password", // Placeholder
  },
});

exports.sendOtpEmail = functions.https.onCall(async (data, context) => {
  const { email, otp } = data;

  if (!email || !otp) {
    throw new functions.https.HttpsError(
      'invalid-argument', 
      'Both email and otp are required for secure dispatch.'
    );
  }

  try {
    // Dispatch BFI-Branded Security Email
    await transporter.sendMail({
      from: '"BFI Security" <security@bharathfilm.com>',
      to: email,
      subject: "BFI | Security Authorization Token",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #000; color: #fff; padding: 40px; border-radius: 24px; max-width: 500px; margin: auto; border: 1px solid #333;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #facc15; font-size: 28px; margin: 0; letter-spacing: 2px;">BFI</h2>
            <p style="color: #666; font-size: 10px; text-transform: uppercase; letter-spacing: 4px; margin-top: 5px;">Bharath Film Industry</p>
          </div>
          <p style="font-size: 14px; color: #ccc; line-height: 1.6;">A request for institutional registration has been initiated for this node. Enter the authorization token below to establish your production credit.</p>
          <div style="background-color: #111; padding: 30px; text-align: center; border-radius: 16px; border: 1px solid #facc15; margin: 30px 0;">
            <h1 style="color: #facc15; font-size: 48px; letter-spacing: 12px; margin: 0; font-family: monospace;">${otp}</h1>
          </div>
          <p style="color: #555; font-size: 11px; text-align: center; margin-top: 20px;">
            This token is valid for 5 minutes.<br/>
            Secure Encryption: AES-256-GCM Authorized.
          </p>
        </div>
      `
    });

    return { success: true, message: "BFI Security Token Dispatched." };
  } catch (error) {
    console.error("BFI Security Bridge Failure:", error);
    throw new functions.https.HttpsError('internal', 'Failed to dispatch security token.');
  }
});
