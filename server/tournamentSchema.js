const mongoose = require('mongoose');

// Add a battle state schema to track health and other battle-specific info
const battleStateSchema = new mongoose.Schema({
  nft1: {
    id: Number,
    name: String,
    image: String,
    health: { type: Number, default: 32 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 }
  },
  nft2: {
    id: Number,
    name: String,
    image: String,
    health: { type: Number, default: 32 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 }
  },
  currentAttacker: { type: String, enum: ['nft1', 'nft2'] },
  lastUpdate: Date
});

// Tournament Schema
const tournamentSchema = new mongoose.Schema({
  currentRound: Number,
  brackets: Array,
  currentMatch: Object,
  currentMatches: {
    type: Array,
    default: []
  },
  currentFeaturedMatch: {
    type: Object,
    default: null
  },
  // Add featured battle state
  featuredBattle: {
    type: battleStateSchema,
    default: null
  },
  completedMatchKeys: {
    type: [String],
    default: []
  },
  winners: Array,
  isRunning: Boolean,
  roundSizes: Array,
  lastUpdate: Date,
  startedAt: Date,
  completedAt: Date
});

// Update the toTournamentState method to include featured battle
tournamentSchema.methods.toTournamentState = function() {
  const obj = this.toObject();
  return {
    ...obj,
    completedMatches: new Set(obj.completedMatchKeys || []),
    currentFeaturedMatch: obj.featuredBattle ? {
      nft1: obj.featuredBattle.nft1,
      nft2: obj.featuredBattle.nft2
    } : null
  };
};

// Add method to update featured battle
tournamentSchema.methods.updateFeaturedBattle = async function(battle) {
  if (!battle) {
    this.featuredBattle = null;
  } else {
    this.featuredBattle = {
      nft1: battle.nft1,
      nft2: battle.nft2,
      currentAttacker: battle.currentAttacker || 'nft1',
      lastUpdate: new Date()
    };
  }
  return this.save();
};

// Before saving, convert completedMatches Set to array
tournamentSchema.pre('save', function(next) {
  if (this.completedMatches instanceof Set) {
    this.completedMatchKeys = Array.from(this.completedMatches);
  }
  next();
});

const Tournament = mongoose.model('Tournament', tournamentSchema);

module.exports = Tournament;