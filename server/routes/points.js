const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const User = require('../userSchema'); // adjust path as needed

// Points update route
router.post('/user/points/update', isAuthenticated, async (req, res) => {
  try {
    const { points } = req.body;
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate new points balance and round to 2 decimal places
    const newPoints = Number((user.points + points).toFixed(2));
    
    // Prevent negative points
    if (newPoints < 0) {
      return res.status(400).json({ message: 'Insufficient points' });
    }

    user.points = newPoints;
    await user.save();

    res.json({
      message: 'Points updated successfully',
      points: newPoints
    });

  } catch (error) {
    console.error('Error updating points:', error);
    res.status(500).json({ message: 'Failed to update points' });
  }
});

module.exports = router; 