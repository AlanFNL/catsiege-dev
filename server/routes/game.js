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

// === AutoBattle Game Constants ===
const AUTO_BATTLE_ENTRY_PRICE = 50;
const AUTO_BATTLE_WIN_MULTIPLIER = 1.9;
const AUTO_BATTLE_LOSS_MULTIPLIER = 0.5;
const PLATFORM_FEE_PERCENT = 5; // 5% fee

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

    // Store the guess and its result
    session.lastGuess = guess;
    
    // Calculate new multiplier based on turns
    const multiplierIndex = Math.min(7, Math.floor(session.playerTurns));
    session.currentMultiplier = TURN_MULTIPLIERS[multiplierIndex];

    // Process guess
    if (guess === session.secretNumber) {
      session.lastGuessResult = 'win';
      // End session
      session.isActive = false;
      await session.save();

      return res.json({
        result: 'win',
        winnings: ENTRY_PRICE * session.currentMultiplier,
        lastGuess: guess,
        lastGuessResult: 'win'
      });
    }

    // Update range and store guess result
    if (guess < session.secretNumber) {
      session.lastGuessResult = 'higher';
      session.minRange = Math.max(session.minRange, guess + 1);
    } else {
      session.lastGuessResult = 'lower';
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
      isCpuTurn: session.isCpuTurn,
      timeLeft: session.timeLeft,
      lastGuess: session.lastGuess,
      lastGuessResult: session.lastGuessResult
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

// === AutoBattle Game Endpoints ===

// Start an AutoBattle game session
router.post('/autobattle/start', isAuthenticated, async (req, res) => {
  try {
    // Check if user has enough points
    const user = await User.findById(req.userId);
    if (user.points < AUTO_BATTLE_ENTRY_PRICE) {
      return res.status(400).json({ 
        message: 'Insufficient points',
        userPoints: user.points
      });
    }

    // Calculate fee and entry
    const platformFeeAmount = AUTO_BATTLE_ENTRY_PRICE * (PLATFORM_FEE_PERCENT / 100);
    const actualEntryAmount = AUTO_BATTLE_ENTRY_PRICE - platformFeeAmount;

    // Deduct entry cost from user
    user.points -= AUTO_BATTLE_ENTRY_PRICE;
    await user.save();

    // Add the platform fee to the bankroll
    // Assuming we have a Bankroll model or we're updating a field in an existing model
    // This is simplified - you would need to implement the actual bankroll update
    try {
      // Find the admin user or system account to add bankroll
      const adminUser = await User.findOne({ isAdmin: true });
      if (adminUser) {
        adminUser.bankroll = (adminUser.bankroll || 0) + platformFeeAmount;
        await adminUser.save();
      }
    } catch (bankrollError) {
      console.error('Warning: Could not update bankroll:', bankrollError);
      // Continue with the game even if bankroll update fails
    }

    // Return success response with user's updated balance
    res.json({
      message: 'AutoBattle game started successfully',
      entryPaid: AUTO_BATTLE_ENTRY_PRICE,
      platformFee: platformFeeAmount,
      userPoints: user.points,
      previousPoints: user.points + AUTO_BATTLE_ENTRY_PRICE
    });

  } catch (error) {
    console.error('Error starting AutoBattle game:', error);
    res.status(500).json({ message: 'Failed to start AutoBattle game' });
  }
});

// Complete an AutoBattle game and process rewards
router.post('/autobattle/complete', isAuthenticated, async (req, res) => {
  try {
    const { winner } = req.body;
    
    if (typeof winner !== 'string' || !['player', 'enemy', 'draw'].includes(winner)) {
      return res.status(400).json({ message: 'Invalid winner value provided', success: false });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found', success: false });
    }

    let pointsChange = 0;
    let message = '';

    if (winner === 'player') {
      // Player wins - gets 1.9x their entry
      pointsChange = AUTO_BATTLE_ENTRY_PRICE * AUTO_BATTLE_WIN_MULTIPLIER;
      message = 'Victory! You earned points!';
    } else if (winner === 'enemy') {
      // Player loses - already paid entry fee, no additional change
      pointsChange = 0; // Entry fee was already deducted when starting
      message = 'Defeat! Better luck next time.';
    } else {
      // Draw - player gets back 50% of entry
      pointsChange = AUTO_BATTLE_ENTRY_PRICE * AUTO_BATTLE_LOSS_MULTIPLIER;
      message = 'Draw! You recovered some points.';
    }

    // Add any winnings to user's balance
    if (pointsChange > 0) {
      user.points += pointsChange;
      await user.save();
    }

    // Return the results with success flag and timestamp
    res.json({
      success: true,
      message,
      winner,
      pointsChange,
      entryPaid: AUTO_BATTLE_ENTRY_PRICE,
      netResult: pointsChange - AUTO_BATTLE_ENTRY_PRICE, // Net profit/loss
      currentPoints: user.points,
      previousPoints: user.points - pointsChange, // Points before this win
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error completing AutoBattle game:', error);
    res.status(500).json({ message: 'Failed to complete AutoBattle game', success: false });
  }
});

module.exports = router; 