const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// RFC-5322-inspired email regex — catches obvious malformations beyond isEmail()
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const signToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Trim and normalise inputs
    const name = (req.body.name || '').trim();
    const email = (req.body.email || '').trim().toLowerCase();
    const password = (req.body.password || '').trim();

    // Extra name length check
    if (name.length < 2) {
      return res.status(400).json({ success: false, message: 'Name must be at least 2 characters' });
    }

    // Stronger email format check
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    // Password minimum length (8)
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const existing = await User.findOne({ email }).select('_id');
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    const user = await User.create({ name, email, password });
    const token = signToken(user);

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const email = (req.body.email || '').trim().toLowerCase();
    const password = (req.body.password || '').trim();

    // Always fetch the user and run bcrypt.compare to prevent timing attacks.
    // Use a dummy hash when the user does not exist so the response time is
    // identical whether the account is missing or the password is wrong.
    const DUMMY_HASH = '$2a$12$dummyhashfornonexistentuserXXXXXXXXXXXXXXXXXXX';

    const user = await User.findOne({ email }).select('+password');
    const hash = user ? user.password : DUMMY_HASH;
    const passwordMatch = await bcrypt.compare(password, hash);

    if (!user || !passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = signToken(user);

    // Return user data without password
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    next(err);
  }
};

// Forgot password — generates a reset token stored on the user.
// In production wire this up to an email service (SendGrid, Resend, etc.).
// Forgot password — generates a reset token and sends via email
const nodemailer = require('nodemailer');

const forgotPassword = async (req, res, next) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: true, message: 'If an account exists with this email, a reset link has been sent.' });
    }

    const resetToken = jwt.sign(
      { id: user._id, purpose: 'reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Setup nodemailer with better config for production
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
      connectionTimeout: 10000,
    });

    // Verify connection configuration
    try {
      await transporter.verify();
      console.log('[auth] SMTP connection successful');
    } catch (verifyErr) {
      console.error('[auth] SMTP Verification Failed:', verifyErr.message);
      return res.status(503).json({ success: false, message: 'Email service configuration error.' });
    }

    const mailOptions = {
      from: `"DevFlow AI" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request - DevFlow AI',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #7c3aed;">Password Reset</h2>
          <p>You requested a password reset for your DevFlow AI account. Click the button below to set a new password:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0;">Reset Password</a>
          <p>This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">DevFlow AI - The intelligent developer playground.</p>
        </div>
      `,
    };

    console.log(`[auth] Attempting to send reset email to: ${email}`);
    await transporter.sendMail(mailOptions);
    console.log(`[auth] Reset email sent successfully to: ${email}`);

    res.json({ success: true, message: 'If an account exists with this email, a reset link has been sent.' });
  } catch (err) {
    console.error('[auth] SMTP Error:', err.message);
    // Even if email fails, don't crash, but send a proper error to frontend
    res.status(503).json({ success: false, message: 'Email service is temporarily unavailable. Please try again later.' });
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Token and password are required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.purpose !== 'reset') {
      return res.status(400).json({ success: false, message: 'Invalid token purpose' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = password; // Will be hashed by pre-save middleware
    await user.save();

    res.json({ success: true, message: 'Password has been reset successfully. Please log in.' });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(400).json({ success: false, message: 'Reset link has expired' });
    }
    next(err);
  }
};

module.exports = { register, login, getMe, forgotPassword, resetPassword };
