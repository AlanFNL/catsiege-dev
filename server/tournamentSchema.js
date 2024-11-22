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

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Modified tournament initialization
socket.on('initializeTournament', async (data) => {
  try {
    const nfts = await fetchNFTsFromMagicEden();
    const tournament = new Tournament({
      brackets: [nfts.map(nft => ({ ...nft, health: 2, wins: 0, losses: 0 }))],
      currentRound: 0,
      isRunning: true,
      roundSizes: [512, 256, 128, 64, 32, 16, 8, 4, 2, 1],
      lastUpdate: Date.now(),
      startedAt: Date.now()
    });
    
    await tournament.save();
    tournamentState = tournament.toObject();
    
    io.emit('tournamentState', tournamentState);
    runTournament();
  } catch (error) {
    socket.emit('error', { message: 'Failed to initialize tournament' });
  }
});

// Modified runTournament function
async function runTournament() {
  while (tournamentState.isRunning) {
    // ... existing battle logic ...

    // Update database after each round
    await Tournament.findByIdAndUpdate(tournamentState._id, {
      currentRound: tournamentState.currentRound,
      brackets: tournamentState.brackets,
      lastUpdate: Date.now()
    });

    if (currentBracket.length <= 1) {
      await Tournament.findByIdAndUpdate(tournamentState._id, {
        isRunning: false,
        winners: currentBracket,
        completedAt: Date.now()
      });
    }
  }
}