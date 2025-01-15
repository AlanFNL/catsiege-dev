const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../userSchema');
const { isAuthenticated } = require('../middleware/auth');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Public routes (no auth required)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', email); // Debug log

    const user = await User.findOne({ email });
    console.log('User found:', user ? 'yes' : 'no'); // Debug log

    if (!user) {
      console.log('No user found with email:', email); // Debug log
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isValidPassword); // Debug log

    if (!isValidPassword) {
      console.log('Invalid password for user:', email); // Debug log
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    
    const userResponse = {
      _id: user._id,
      email: user.email,
      points: user.points,
      completedQuests: user.completedQuests
    };

    console.log('Login successful for:', email); // Debug log

    res.json({
      message: 'Login successful',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Login error:', error); // Debug log
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
      points: 50,
      completedQuests: [{
        questId: 'register',
        completedAt: new Date(),
        lastClaim: new Date()
      }]
    });

    await user.save();

    const token = generateToken(user._id);
    
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
    res.status(500).json({ message: 'Registration failed' });
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