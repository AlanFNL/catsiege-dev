const express = require('express');
const { isAuthenticated } = require('../middleware/auth');
const User = require('../userSchema');
const router = express.Router();

// Quest definitions (matching frontend)
const QUESTS = {
  REGISTER: {
    id: 'REGISTER',
    points: 100,
    type: 'one-time'
  },
  DAILY_LOGIN: {
    id: 'DAILY_LOGIN',
    points: 50,
    type: 'daily'
  },
  NFT_HOLDER: {
    id: 'NFT_HOLDER',
    points: 750,
    type: 'one-time'
  }
};

// Get user's completed quests
router.get('/user/quests', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      completedQuests: user.completedQuests || [],
      points: user.points
    });
  } catch (error) {
    console.error('Error fetching quests:', error);
    res.status(500).json({ message: 'Failed to fetch quests' });
  }
});

// Claim a quest
router.post('/user/quests/claim', isAuthenticated, async (req, res) => {
  try {
    const { questId } = req.body;
    const quest = QUESTS[questId];

    if (!quest) {
      return res.status(400).json({ message: 'Invalid quest' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize completedQuests array if it doesn't exist
    if (!user.completedQuests) {
      user.completedQuests = [];
    }

    // Check if one-time quest is already completed
    if (quest.type === 'one-time') {
      const isCompleted = user.completedQuests.some(q => q.questId === questId);
      if (isCompleted) {
        return res.status(400).json({ message: 'Quest already completed' });
      }
    }

    // Check daily quest cooldown
    if (quest.type === 'daily') {
      const lastClaim = user.completedQuests.find(q => q.questId === questId)?.lastClaim;
      if (lastClaim) {
        const today = new Date().toISOString().split('T')[0];
        const lastClaimDate = new Date(lastClaim).toISOString().split('T')[0];
        
        if (lastClaimDate === today) {
          return res.status(400).json({ message: 'Daily quest already claimed today' });
        }
      }
    }

    // Add or update quest completion
    const now = new Date();
    const questCompletion = {
      questId,
      completedAt: now,
      lastClaim: now
    };

    const existingQuestIndex = user.completedQuests.findIndex(q => q.questId === questId);
    if (existingQuestIndex >= 0) {
      user.completedQuests[existingQuestIndex].lastClaim = now;
    } else {
      user.completedQuests.push(questCompletion);
    }

    // Update points
    user.points = (user.points || 0) + quest.points;

    await user.save();

    res.json({
      message: 'Quest claimed successfully',
      completedQuests: user.completedQuests,
      totalPoints: user.points,
      pointsEarned: quest.points
    });

  } catch (error) {
    console.error('Error claiming quest:', error);
    res.status(500).json({ message: 'Failed to claim quest' });
  }
});

module.exports = router;