const express = require('express');
const {isAuthenticated} = require('../middleware/auth.js');
const User = require('../userSchema.js');

const router = express.Router();

// Get user details including NFT verification status
router.get('/me', isAuthenticated, async (req, res) => {
  try {
    console.log('Fetching complete user data for ID:', req.userId);
    
    const user = await User.findById(req.userId)
      .select('-password')
      .lean();
    
    if (!user) {
      console.log('No user found');
      return res.status(404).json({ message: 'User not found' });
    }

    // Explicitly map the user data we want to send to frontend
    const mappedUserData = {
      id: user._id,
      email: user.email,
      walletAddress: user.walletAddress || null,
      points: user.points || 0,
      quests: {
        nftVerified: user.quests?.nftVerified || false,
        nftHolder: user.quests?.nftHolder || false
      },
      completedQuests: user.completedQuests || []
    };
    
    console.log('Mapped user data for frontend:', mappedUserData);
    res.json(mappedUserData);
  } catch (error) {
    console.error('Error fetching user data:', error);
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
          'quests.nftVerified': verified,
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

// Add this new route to check NFT verification status
router.get('/nft-status', isAuthenticated, async (req, res) => {
  try {
    console.log('Checking NFT status for user:', req.userId);
    
    const user = await User.findById(req.userId)
      .select('quests.nftVerified walletAddress')
      .lean();
    
    if (!user) {
      console.log('No user found');
      return res.status(404).json({ message: 'User not found' });
    }

    // Explicitly map the NFT status data
    const nftStatus = {
      nftVerified: user.quests?.nftVerified || false,
      walletAddress: user.walletAddress || null
    };

    console.log('NFT status:', nftStatus);
    res.json(nftStatus);
  } catch (error) {
    console.error('Error checking NFT status:', error);
    res.status(500).json({ message: 'Error checking NFT status' });
  }
});

module.exports = router;