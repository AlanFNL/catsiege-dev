const mongoose = require('mongoose');

const gameStatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  turnsToWin: {
    type: Number,
    required: true
  },
  endingMultiplier: {
    type: Number,
    required: true
  },
  roi: {
    type: Number,
    required: true
  },
  pointsWon: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
gameStatSchema.index({ userId: 1, timestamp: -1 });

const GameStat = mongoose.model('GameStat', gameStatSchema);
module.exports = GameStat;