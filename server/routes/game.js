const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const GameSession = require('../gameSessionSchema');
const User = require('../userSchema');

const TURN_MULTIPLIERS = {
  0: 1.7,
  1: 1.25,
  2: 1.08,
  3: 1.04,
  4: 0.92,
  5: 0.84,
  6: 0.76,
  7: 0.68,
};

const ENTRY_PRICE = 5;

// Get current game session
router.get('/session', isAuthenticated, async (req, res) => {
  try {
    const session = await GameSession.findOne({
      userId: req.userId,
      isActive: true
    });

    if (!session) {
      return res.json(null);
    }

    res.json(session);
  } catch (error) {
    console.error('Error fetching game session:', error);
    res.status(500).json({ message: 'Failed to fetch game session' });
  }
});

// Create new game session
router.post('/session/create', isAuthenticated, async (req, res) => {
  try {
    // Check if user has enough points
    const user = await User.findById(req.userId);
    if (user.points < ENTRY_PRICE) {
      return res.status(400).json({ message: 'Insufficient points' });
    }

    // Check for existing active session
    const existingSession = await GameSession.findOne({
      userId: req.userId,
      isActive: true
    });

    if (existingSession) {
      return res.status(400).json({ message: 'Active session already exists' });
    }

    // Deduct entry price
    user.points -= ENTRY_PRICE;
    await user.save();

    // Create new session
    const session = new GameSession({
      userId: req.userId,
      secretNumber: Math.floor(Math.random() * 256) + 1,
      currentMultiplier: TURN_MULTIPLIERS[0]
    });

    await session.save();

    res.json(session);
  } catch (error) {
    console.error('Error creating game session:', error);
    res.status(500).json({ message: 'Failed to create game session' });
  }
});

// Submit a guess
router.post('/guess', isAuthenticated, async (req, res) => {
  try {
    const { guess } = req.body;
    const session = await GameSession.findOne({
      userId: req.userId,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({ message: 'No active game session found' });
    }

    // Update session state
    session.turns += 1;
    if (!session.isCpuTurn) {
      session.playerTurns += 1;
    }

    // Calculate new multiplier based on turns
    const multiplierIndex = Math.min(7, Math.floor(session.turns / 2));
    session.currentMultiplier = TURN_MULTIPLIERS[multiplierIndex];

    // Process guess
    if (guess === session.secretNumber) {
      // Handle win
      const winnings = ENTRY_PRICE * session.currentMultiplier;
      
      // Update user points
      const user = await User.findById(req.userId);
      user.points += winnings;
      await user.save();

      // End session
      session.isActive = false;
      await session.save();

      return res.json({
        result: 'win',
        winnings,
        newBalance: user.points
      });
    }

    // Update range based on guess
    if (guess < session.secretNumber) {
      session.minRange = Math.max(session.minRange, guess + 1);
    } else {
      session.maxRange = Math.min(session.maxRange, guess - 1);
    }

    // Toggle turn
    session.isCpuTurn = !session.isCpuTurn;
    session.timeLeft = 15;

    await session.save();

    res.json({
      result: 'continue',
      minRange: session.minRange,
      maxRange: session.maxRange,
      turns: session.turns,
      playerTurns: session.playerTurns,
      currentMultiplier: session.currentMultiplier,
      isCpuTurn: session.isCpuTurn
    });

  } catch (error) {
    console.error('Error processing guess:', error);
    res.status(500).json({ message: 'Failed to process guess' });
  }
});

// End game session (forfeit or timeout)
router.post('/session/end', isAuthenticated, async (req, res) => {
  try {
    const session = await GameSession.findOne({
      userId: req.userId,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({ message: 'No active game session found' });
    }

    session.isActive = false;
    await session.save();

    res.json({ message: 'Game session ended' });
  } catch (error) {
    console.error('Error ending game session:', error);
    res.status(500).json({ message: 'Failed to end game session' });
  }
});

module.exports = router; 