const mongoose = require('mongoose');

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
  completedMatchKeys: {
    type: [String], // Store completed match keys as array of strings
    default: []
  },
  winners: Array,
  isRunning: Boolean,
  roundSizes: Array,
  lastUpdate: Date,
  startedAt: Date,
  completedAt: Date
});

// When converting to tournament state, transform completedMatchKeys array to Set
tournamentSchema.methods.toTournamentState = function() {
  const obj = this.toObject();
  return {
    ...obj,
    completedMatches: new Set(obj.completedMatchKeys || [])
  };
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