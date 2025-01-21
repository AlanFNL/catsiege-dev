const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const GameStat = require('../gameSchema');
const { isAuthenticated } = require('../middleware/auth');
const { isAdmin } = require('../middleware/adminAuth');

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

// Get game statistics for users
router.get('/user-stats', isAuthenticated, async (req, res) => {
  try {
    const userId = req.userId;
    
    // Get total games played
    const totalGames = await GameStat.countDocuments({ userId });
    
    // Get average ROI
    const stats = await GameStat.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
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

// Get game statistics for admin (renamed from /game-stats to /admin-stats)
router.get('/admin-stats', isAuthenticated, isAdmin, async (req, res) => {
  try {
    // Get total games played
    const totalGames = await GameStat.countDocuments();
    
    // Get recent games with user info
    const recentGames = await GameStat.find()
      .populate('userId', 'email')
      .sort({ timestamp: -1 })
      .limit(15)
      .lean();
    
    // Get average stats
    const stats = await GameStat.aggregate([
      {
        $group: {
          _id: null,
          avgRoi: { $avg: '$roi' },
          avgTurns: { $avg: '$turnsToWin' },
          avgMultiplier: { $avg: '$endingMultiplier' }
        }
      }
    ]);

    // Format the response with proper number formatting
    const formattedResponse = {
      totalGames,
      recentGames: recentGames.map(game => ({
        _id: game._id,
        timestamp: game.timestamp,
        turnsToWin: game.turnsToWin,
        endingMultiplier: Number(game.endingMultiplier.toFixed(2)),
        roi: Number(game.roi.toFixed(2)),
        userEmail: game.userId?.email || 'Unknown'
      })),
      statistics: {
        avgRoi: Number((stats[0]?.avgRoi || 0).toFixed(2)),
        avgTurns: Number((stats[0]?.avgTurns || 0).toFixed(1)),
        avgMultiplier: Number((stats[0]?.avgMultiplier || 0).toFixed(2))
      }
    };

    res.json(formattedResponse);
  } catch (error) {
    console.error('Error fetching game stats:', error);
    res.status(500).json({ message: 'Failed to fetch game statistics' });
  }
});

module.exports = router; 