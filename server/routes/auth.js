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
    const resetUrl = `https://catsiege.fun/reset-password?token=${resetToken}`;
    
    // Email content with improved deliverability
    const mailOptions = {
      from: `"CatSiege Team" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'CatSiege Password Reset',
      text: `You requested a password reset for your CatSiege account. Click this link to reset your password: ${resetUrl} (valid for 1 hour)`,
      html: `
        <div style="background-color: #000000; padding: 20px; max-width: 600px; margin: 0 auto; border-radius: 10px; font-family: Arial, sans-serif;">
          <img src="https://catsiege.fun/logo.png" alt="CatSiege" style="max-width: 150px; margin-bottom: 20px;" />
          <h1 style="color: #FFF5E4; font-family: Arial, sans-serif; margin-bottom: 20px;">Password Reset</h1>
          <p style="color: #FFF5E4; opacity: 0.8; font-family: Arial, sans-serif;">You requested a password reset for your CatSiege account. Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; color: #FFF5E4; background-color: #000000; text-decoration: none; border-radius: 5px; font-family: Arial, sans-serif; border: 1px solid rgba(255,245,228,0.2); box-shadow: 0 0 10px rgba(255,245,228,0.1); font-weight: bold;">Reset Password</a>
          </div>
          <p style="color: #FFF5E4; opacity: 0.6; font-family: Arial, sans-serif;">This link will expire in 1 hour. If you cannot click the button, copy and paste this URL into your browser:</p>
          <p style="color: #FFF5E4; word-break: break-all; font-size: 12px; margin: 15px 0; padding: 10px; background-color: rgba(255,245,228,0.05); border-radius: 5px;">${resetUrl}</p>
          <p style="color: #FFF5E4; opacity: 0.6; font-family: Arial, sans-serif;">If you didn't request this, please ignore this email or contact us if you have concerns.</p>
          <div style="margin-top: 30px; border-top: 1px solid rgba(255,245,228,0.2); padding-top: 15px;">
            <p style="color: #FFF5E4; opacity: 0.6; font-size: 12px; font-family: Arial, sans-serif; text-align: center;">© CatSiege - <a href="mailto:team@catsiege.com" style="color: #FFF5E4; text-decoration: underline;">team@catsiege.com</a></p>
          </div>
        </div>
      `,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'High'
      }
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