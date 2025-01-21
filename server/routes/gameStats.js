const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const GameStat = require('../gameSchema');
const { isAuthenticated } = require('../middleware/auth');

// Record a new game result
router.post('/game-stats', isAuthenticated, async (req, res) => {
  try {
    const { turnsToWin, endingMultiplier } = req.body;
    const userId = req.userId;

    // Calculate ROI
    const initialBet = 5;
    const pointsWon = Number((initialBet * endingMultiplier).toFixed(2));
    const roi = Number((pointsWon - initialBet).toFixed(2));

    const gameStat = new GameStat({
      userId,
      turnsToWin,
      endingMultiplier,
      roi,
      pointsWon
    });

    await gameStat.save();

    res.status(201).json({
      message: 'Game statistics recorded successfully',
      gameStat
    });
  } catch (error) {
    console.error('Error recording game stats:', error);
    res.status(500).json({ message: 'Failed to record game statistics' });
  }
});

// Get game statistics for a user
router.get('/game-stats', isAuthenticated, async (req, res) => {
  try {
    const userId = req.userId;
    
    // Get total games played
    const totalGames = await GameStat.countDocuments({ userId });
    
    // Get average ROI
    const stats = await GameStat.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          avgRoi: { $avg: '$roi' },
          avgTurns: { $avg: '$turnsToWin' },
          totalPointsWon: { $sum: '$pointsWon' },
          bestMultiplier: { $max: '$endingMultiplier' }
        }
      }
    ]);

    res.json({
      totalGames,
      statistics: stats[0] || {
        avgRoi: 0,
        avgTurns: 0,
        totalPointsWon: 0,
        bestMultiplier: 0
      }
    });
  } catch (error) {
    console.error('Error fetching game stats:', error);
    res.status(500).json({ message: 'Failed to fetch game statistics' });
  }
});

module.exports = router; 