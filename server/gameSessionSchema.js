const mongoose = require('mongoose');

const gameSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  secretNumber: {
    type: Number,
    required: true
  },
  turns: {
    type: Number,
    default: 0
  },
  playerTurns: {
    type: Number,
    default: 0
  },
  minRange: {
    type: Number,
    default: 1
  },
  maxRange: {
    type: Number,
    default: 256
  },
  currentMultiplier: {
    type: Number,
    required: true
  },
  isCpuTurn: {
    type: Boolean,
    default: false
  },
  timeLeft: {
    type: Number,
    default: 15
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 // Session expires after 1 hour
  },
  lastGuess: {
    type: Number,
    default: null
  },
  lastGuessResult: {
    type: String,
    enum: ['higher', 'lower', 'win', null],
    default: null
  }
});

const GameSession = mongoose.model('GameSession', gameSessionSchema);
module.exports = GameSession; 