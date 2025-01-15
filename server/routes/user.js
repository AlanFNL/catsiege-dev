const express = require('express');
const {isAuthenticated} = require('../middleware/auth.js');
const User = require('../userSchema.js');

const router = express.Router();

// Get user details
router.get('/me', isAuthenticated, async (req, res) => {
  try {
    console.log('Fetching user data for ID:', req.userId);
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      console.log('No user found');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User found:', {
      id: user._id,
      quests: user.quests,
      walletAddress: user.walletAddress
    });
    
    res.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
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

// Update NFT holder quest status
router.post('/quests/nft-holder', isAuthenticated, async (req, res) => {
  try {
    const { verified, walletAddress } = req.body;
    console.log('Updating NFT holder status:', { userId: req.userId, verified, walletAddress });
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { 
        $set: {
          'quests.nftHolder': verified,
          walletAddress
        }
      },
      { new: true }
    ).select('-password');
    
    console.log('Updated user:', user);
    res.json(user);
  } catch (error) {
    console.error('Error updating NFT holder quest:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;