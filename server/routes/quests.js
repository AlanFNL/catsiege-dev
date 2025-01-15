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

// Helper function to check if enough time has passed since last claim
const canClaimDaily = (lastClaimDate) => {
  if (!lastClaimDate) return true;
  
  const now = new Date();
  const last = new Date(lastClaimDate);
  const hoursSinceLastClaim = (now - last) / (1000 * 60 * 60);
  
  return hoursSinceLastClaim >= 24;
};

// Get user's completed quests
router.get('/user/quests', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Add next available claim time for daily quests
    const completedQuestsWithTiming = user.completedQuests.map(quest => {
      if (quest.questId === 'DAILY_LOGIN') {
        const lastClaim = new Date(quest.lastClaim);
        const nextAvailable = new Date(lastClaim.getTime() + (24 * 60 * 60 * 1000));
        return {
          ...quest.toObject(),
          nextAvailable: nextAvailable.toISOString()
        };
      }
      return quest.toObject();
    });
    
    res.json({
      completedQuests: completedQuestsWithTiming,
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
      if (lastClaim && !canClaimDaily(lastClaim)) {
        return res.status(400).json({ 
          message: 'Daily quest not ready yet',
          nextAvailable: new Date(new Date(lastClaim).getTime() + (24 * 60 * 60 * 1000)).toISOString()
        });
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

    // Update points with 2 decimal precision
    user.points = Number((user.points + quest.points).toFixed(2));

    await user.save();

    // Include next available time for daily quests
    const completedQuestsWithTiming = user.completedQuests.map(quest => {
      if (quest.questId === 'DAILY_LOGIN') {
        const nextAvailable = new Date(now.getTime() + (24 * 60 * 60 * 1000));
        return {
          ...quest.toObject(),
          nextAvailable: nextAvailable.toISOString()
        };
      }
      return quest.toObject();
    });

    res.json({
      message: 'Quest claimed successfully',
      completedQuests: completedQuestsWithTiming,
      totalPoints: user.points,
      pointsEarned: quest.points
    });

  } catch (error) {
    console.error('Error claiming quest:', error);
    res.status(500).json({ message: 'Failed to claim quest' });
  }
});

router.post('/claim', isAuthenticated, async (req, res) => {
  try {
    const { questId } = req.body;
    console.log('Claiming quest:', { userId: req.userId, questId });

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if quest is already completed (for one-time quests)
    const isCompleted = user.completedQuests.some(q => q.questId === questId);
    if (isCompleted && questId !== 'DAILY_LOGIN') {
      return res.status(400).json({ message: 'Quest already completed' });
    }

    // Special handling for NFT holder quest
    if (questId === 'NFT_HOLDER') {
      if (!user.quests?.nftVerified) {
        return res.status(400).json({ message: 'NFT not verified' });
      }
    }

    // Add quest to completed quests
    const completedQuest = {
      questId,
      completedAt: new Date(),
      lastClaim: new Date()
    };

    user.completedQuests.push(completedQuest);

    // Update points
    const questPoints = QUESTS[questId]?.points || 0;
    user.points += questPoints;

    // For NFT holder quest, mark it as claimed
    if (questId === 'NFT_HOLDER') {
      user.quests.nftHolder = true;
    }

    await user.save();
    console.log('Quest claimed successfully:', {
      questId,
      points: questPoints,
      totalPoints: user.points
    });

    res.json({
      completedQuests: user.completedQuests,
      totalPoints: user.points
    });
  } catch (error) {
    console.error('Error claiming quest:', error);
    res.status(500).json({ message: 'Error claiming quest' });
  }
});

module.exports = router;