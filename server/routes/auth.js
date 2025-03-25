const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../userSchema');
const { isAuthenticated } = require('../middleware/auth');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const SALT_ROUNDS = 12;

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};


const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465, // Use 587 for TLS, 465 for SSL
  secure: true, // true for port 465, false for others
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Public routes (no auth required)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);
    console.log('Request body:', req.body);
    console.log('Using salt rounds:', SALT_ROUNDS);

    const user = await User.findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('No user found with email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('Stored hashed password:', user.password);
    console.log('Attempting to compare with provided password');
    
    const storedSaltRounds = user.password.split('$')[2];
    console.log('Stored password salt rounds:', storedSaltRounds);
    
    const isValidPassword = await user.comparePassword(password);
    console.log('Password comparison result:', isValidPassword);

    if (!isValidPassword) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });
    console.log('Token generated:', !!token);

    const userResponse = {
      _id: user._id,
      email: user.email,
      points: user.points,
      completedQuests: user.completedQuests
    };

    console.log('Login successful, sending response');
    res.json({
      message: 'Login successful',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Login failed', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Password reset request
router.post('/request-reset', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    
    // Even if user is not found, send a success response for security
    if (!user) {
      console.log('Password reset requested for non-existent email:', email);
      return res.status(200).json({ 
        message: 'If your email exists in our system, you will receive reset instructions shortly.' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    // Save token and expiry to user
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // Send email with reset link
    const resetUrl = `${process.env.FRONTEND_URL || 'https://catsiege-dev.alanfnl09.com'}/reset-password?token=${resetToken}`;
    
    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset</h1>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; color: white; background-color: #4a76a8; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Password reset email sent to:', email);
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
      // We still send success response even if email fails
    }

    res.status(200).json({ 
      message: 'If your email exists in our system, you will receive reset instructions shortly.' 
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    // Find user with valid token
    const user = await User.findOne({ 
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash new password
    user.password = newPassword; // Schema pre-save hook will hash it
    
    // Clear reset token fields
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    
    await user.save();
    
    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Registration attempt for:', email);
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      email,
      password,
      points: 0,
      completedQuests: [{

      }],
      walletAddress: null,
      quests: [{
        nftVerified: false
      }]
    });

    await user.save();
    console.log('User saved successfully with hashed password:', user.password);

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    const userResponse = {
      _id: user._id,
      email: user.email,
      points: user.points,
      completedQuests: user.completedQuests
    };

    res.status(201).json({
      message: 'Registration successful',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Registration failed',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Protected route (auth required)
router.post('/logout', isAuthenticated, async (req, res) => {
  try {
    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ message: 'Logout failed' });
  }
});

module.exports = router;