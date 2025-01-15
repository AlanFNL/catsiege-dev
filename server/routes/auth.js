const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../userSchema');
const { isAuthenticated } = require('../middleware/auth');

const SALT_ROUNDS = 12;

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

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