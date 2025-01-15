const express = require('express');
const {isAuthenticated} = require('../middleware/auth.js');
const User = require('../userSchema.js');

const router = express.Router();

// Get user details
router.get('/me', isAuthenticated, async (req, res) => {
  try {
    console.log('Backend: Fetching user data for ID:', req.userId); // Debug log
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      console.log('Backend: No user found'); // Debug log
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Backend: User found:', user); // Debug log
    res.json({ user });
  } catch (error) {
    console.error('Backend: Error fetching user:', error); // Debug log
    res.status(500).json({ message: 'Error fetching user data' });
  }
});

// Update wallet address
router.post('/wallet', isAuthenticated, async (req, res) => {
  try {
    const { walletAddress } = req.body;
    const user = await User.findByIdAndUpdate(
      req.session.userId,
      { walletAddress },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user NFTs
router.get('/nfts', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    res.json(user.nfts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;