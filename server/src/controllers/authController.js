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
const forgotPassword = async (req, res, next) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Always respond 200 to prevent email enumeration
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: true, message: 'If an account exists with this email, a reset link has been sent.' });
    }

    // Generate a simple signed reset token (valid 1 hour)
    const resetToken = jwt.sign(
      { id: user._id, purpose: 'reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // In development, log the reset link
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    if (process.env.NODE_ENV === 'development') {
      console.log(`[auth] Password reset link for ${email}: ${resetUrl}`);
    }

    // TODO: Send email via SendGrid/Resend/Nodemailer in production
    // await sendResetEmail(email, resetUrl);

    res.json({ success: true, message: 'If an account exists with this email, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, forgotPassword };
