const mongoose = require('mongoose');

// Tournament Schema
const tournamentSchema = new mongoose.Schema({
  currentRound: Number,
  brackets: Array,
  currentMatch: Object,
  winners: Array,
  isRunning: Boolean,
  roundSizes: Array,
  lastUpdate: Date,
  startedAt: Date,
  completedAt: Date
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