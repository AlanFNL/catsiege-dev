require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors({
  origin: "*",
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Tournament Schema
const tournamentSchema = new mongoose.Schema({
  currentRound: Number,
  brackets: Array,
  currentMatch: Object,
  currentMatches: Array,
  currentFeaturedMatch: Object,
  winners: Array,
  isRunning: Boolean,
  roundSizes: Array,
  lastUpdate: Date,
  startedAt: Date,
  completedAt: Date
});

const Tournament = mongoose.model('Tournament', tournamentSchema);

// Modified tournament state initialization
let tournamentState = {
  currentRound: 0,
  brackets: [],
  currentMatch: null,
  currentMatches: [],
  completedMatches: new Set(),
  currentFeaturedMatch: null,
  winners: [],
  isRunning: false,
  roundSizes: [512, 256, 128, 64, 32, 16, 8, 4, 2, 1],
  lastUpdate: Date.now()
};

// Add this function to calculate upcoming matches
function getUpcomingMatches(tournamentState) {
  const currentBracket = tournamentState.brackets[tournamentState.currentRound];
  const currentMatchIndex = currentBracket.findIndex(
    nft => nft.id === tournamentState.currentMatch?.nft1.id
  );
  
  // If we can't find current match or it's invalid, return empty array
  if (currentMatchIndex === -1 || currentMatchIndex % 2 !== 0) {
    return [];
  }

  const upcomingMatches = [];
  // Look for next 3 matches
  for (let i = currentMatchIndex + 2; i < currentBracket.length - 1; i += 2) {
    // Make sure we have both NFTs for the match
    if (i + 1 < currentBracket.length) {
      upcomingMatches.push({
        nft1: currentBracket[i],
        nft2: currentBracket[i + 1]
      });
    }
    
    // Only get up to 3 upcoming matches
    if (upcomingMatches.length >= 3) break;
  }

  return upcomingMatches;
}

// Modify the calculateTournamentStats function to fix the calculations
function calculateTournamentStats(tournamentState) {
  if (!tournamentState.brackets || !tournamentState.brackets.length) {
    return {
      currentRound: 0,
      totalRounds: tournamentState.roundSizes.length,
      remainingMatches: 0,
      playersLeft: 0,
      roundProgress: 0,
      matchesCompleted: 0,
      totalMatchesInRound: 0,
      upcomingMatches: []
    };
  }

  const currentBracket = tournamentState.brackets[tournamentState.currentRound];
  const currentRoundSize = tournamentState.roundSizes[tournamentState.currentRound];
  const initialMatchesInRound = Math.floor(currentRoundSize / 2);
  
  // Count completed matches for this round
  const completedMatches = tournamentState.currentMatches.reduce((count, match) => {
    const matchKey = `${Math.min(match.nft1.id, match.nft2.id)}-${Math.max(match.nft1.id, match.nft2.id)}`;
    return count + (tournamentState.completedMatches.has(matchKey) ? 1 : 0);
  }, 0);
  
  // Calculate remaining matches in current round
  const remainingMatches = initialMatchesInRound - completedMatches;
  
  // Calculate round progress
  const roundProgress = Math.round((completedMatches / initialMatchesInRound) * 100);

  return {
    currentRound: tournamentState.currentRound + 1,
    totalRounds: tournamentState.roundSizes.length,
    remainingMatches,
    playersLeft: currentBracket.length,
    roundProgress,
    matchesCompleted: completedMatches,
    totalMatchesInRound: initialMatchesInRound,
    upcomingMatches: getUpcomingMatches(tournamentState)
  };
}

// Modify the tournament state emission to include stats
function emitTournamentState() {
  const stats = calculateTournamentStats(tournamentState);
  io.emit('tournamentState', {
    ...tournamentState,
    stats,
    currentFeaturedMatch: tournamentState.currentFeaturedMatch
  });
}

// Modified Socket.IO connection handling
io.on('connection', async (socket) => {
  console.log('Client connected');

  try {
    const ongoingTournament = await Tournament.findOne({ isRunning: true });
    if (ongoingTournament) {
      tournamentState = {
        ...ongoingTournament.toObject(),
        completedMatches: new Set()
      };
      
      // If there's a current featured match, emit it
      if (tournamentState.currentFeaturedMatch) {
        socket.emit('featuredBattle', tournamentState.currentFeaturedMatch);
      }
      
      const stats = calculateTournamentStats(tournamentState);
      socket.emit('tournamentState', { ...tournamentState, stats });
    } else {
      // If no ongoing tournament, check for most recent completed tournament
      const lastCompletedTournament = await Tournament.findOne(
        { completedAt: { $exists: true } },
        {},
        { sort: { completedAt: -1 } }
      );

      if (lastCompletedTournament) {
        console.log('Found completed tournament:', lastCompletedTournament._id);
        socket.emit('tournamentState', {
          ...lastCompletedTournament.toObject(),
          isRunning: false
        });
      }
    }
  } catch (error) {
    console.error('Error checking tournament status:', error);
  }

  socket.on('initializeTournament', async () => {
    try {
      // Check if there's already a running tournament
      const existingTournament = await Tournament.findOne({ isRunning: true });
      if (existingTournament) {
        console.log('Tournament already in progress');
        socket.emit('error', { message: 'A tournament is already in progress' });
        return;
      }

      console.log('Fetching NFTs from Magic Eden...');
      const nfts = await fetchNFTsFromMagicEden();
      console.log(`Fetched ${nfts.length} NFTs`);
      
      if (!nfts || nfts.length < 512) {
        throw new Error('Not enough NFTs fetched');
      }

      // Create new tournament in database
      const newTournament = new Tournament({
        brackets: [nfts.map(nft => ({ ...nft, health: 32, wins: 0, losses: 0 }))],
        currentRound: 0,
        isRunning: true,
        roundSizes: [512, 256, 128, 64, 32, 16, 8, 4, 2, 1],
        lastUpdate: Date.now(),
        startedAt: Date.now()
      });

      console.log('Saving new tournament...');
      await newTournament.save();
      
      tournamentState = {
        ...newTournament.toObject(),
        completedMatches: new Set()
      };
      
      console.log('Tournament created, starting matches...');
      io.emit('tournamentState', tournamentState);
      runTournament();

      // Make sure to emit the initial featured battle
      if (tournamentState.currentMatches && tournamentState.currentMatches.length > 0) {
        const firstMatch = tournamentState.currentMatches[0];
        tournamentState.currentFeaturedMatch = firstMatch;
        emitFeaturedBattle(firstMatch);
      }
      
      emitTournamentState();
    } catch (error) {
      console.error('Tournament initialization error:', error);
      socket.emit('error', { message: 'Failed to initialize tournament' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  // Add handler for changing featured battle
  socket.on('changeFeaturedBattle', (matchIndex) => {
    if (tournamentState.currentMatches && 
        tournamentState.currentMatches[matchIndex]) {
      tournamentState.currentFeaturedMatch = tournamentState.currentMatches[matchIndex];
      emitTournamentState();
    }
  });

  // Add handler for getCurrentTournamentState
  socket.on("getCurrentTournamentState", () => {
    if (tournamentState.isRunning) {
      // Calculate current stats
      const stats = calculateTournamentStats(tournamentState);
      
      // Send complete state to the requesting client
      socket.emit("tournamentState", {
        ...tournamentState,
        stats
      });
    }
  });
});

// Update the simulateBattle function to properly track featured battles
function simulateBattle(nft1, nft2, isFeatured) {
  return new Promise(resolve => {
    const firstAttacker = Math.random() > 0.5 ? nft1 : nft2;
    const secondAttacker = firstAttacker === nft1 ? nft2 : nft1;
    
    // Track if this is the featured battle
    const shouldEmitEvents = isFeatured;

    if (shouldEmitEvents) {
      // Emit the featured battle at the start
      emitFeaturedBattle({
        nft1: { ...nft1 },
        nft2: { ...nft2 }
      });
    }

    // Rest of the battle logic...
    // ... existing code ...

    // Update battle state after each hit
    if (shouldEmitEvents) {
      io.emit('battleUpdate', {
        nft1: { ...nft1 },
        nft2: { ...nft2 }
      });
    }

    // ... rest of existing code ...
  });
}

// Update the emitFeaturedBattle function
function emitFeaturedBattle(battle) {
  if (battle && battle.nft1 && battle.nft2) {
    // Update the tournament state
    tournamentState.currentFeaturedMatch = battle;
    
    // Emit both the featured battle and updated tournament state
    io.emit('featuredBattle', battle);
    emitTournamentState();
  }
}

// Update the runTournament function
async function runTournament() {
  while (tournamentState.isRunning) {
    // Clear completed matches at the start of each round
    tournamentState.completedMatches = new Set();
    
    const currentBracket = tournamentState.brackets[tournamentState.currentRound];
    
    if (currentBracket.length <= 1) {
      console.log('Tournament complete! Winner:', currentBracket[0]);
      tournamentState.isRunning = false;
      tournamentState.winners = currentBracket;
      tournamentState.completedAt = Date.now();
      
      await Tournament.findByIdAndUpdate(tournamentState._id, {
        isRunning: false,
        winners: currentBracket,
        completedAt: Date.now()
      });

      emitTournamentState();
      break;
    }

    // Create pairs of matches
    const matchPairs = [];
    for (let i = 0; i < currentBracket.length; i += 2) {
      if (i + 1 < currentBracket.length) {
        const matchPair = {
          nft1: { ...currentBracket[i] },
          nft2: { ...currentBracket[i + 1] }
        };
        matchPairs.push(matchPair);
      }
    }

    // Select featured battle and emit it immediately
    const randomIndex = Math.floor(Math.random() * matchPairs.length);
    const featuredMatch = matchPairs[randomIndex];
    tournamentState.currentFeaturedMatch = featuredMatch;
    tournamentState.currentMatches = matchPairs;
    
    // Emit the initial state with the featured battle
    emitFeaturedBattle(featuredMatch);
    emitTournamentState();

    // Run battles
    const battlePromises = matchPairs.map(pair => 
      simulateBattle(
        pair.nft1,
        pair.nft2,
        pair === tournamentState.currentFeaturedMatch
      )
    );

    // Wait for all battles to complete
    const winners = await Promise.all(battlePromises);

    // Process winners and handle bye matches
    const finalWinners = [];
    winners.forEach(winner => {
      finalWinners.push({ ...winner, health: 32 });
    });

    // Handle any remaining bye matches
    if (currentBracket.length % 2 !== 0) {
      finalWinners.push({ 
        ...currentBracket[currentBracket.length - 1], 
        health: 32 
      });
    }

    // Update tournament state for next round
    tournamentState = {
      ...tournamentState,
      currentRound: tournamentState.currentRound + 1,
      brackets: [...tournamentState.brackets, finalWinners],
      currentMatches: [], // Clear current matches
      completedMatches: new Set(), // Reset completed matches
      lastUpdate: Date.now()
    };

    // Save to database
    await Tournament.findByIdAndUpdate(tournamentState._id, {
      currentRound: tournamentState.currentRound,
      brackets: tournamentState.brackets,
      lastUpdate: Date.now()
    });

    emitTournamentState();
    
    // Brief pause before next round
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
}

// Function to fetch NFTs from Magic Eden
async function fetchNFTsFromMagicEden() {
  try {
    const batchSize = 100; // Magic Eden's limit per request
    const requiredNFTs = 512;
    const batches = Math.ceil(requiredNFTs / batchSize);
    let allNFTs = [];

    console.log(`Fetching ${batches} batches of NFTs...`);

    // Make multiple requests in parallel
    const requests = Array.from({ length: batches }, (_, i) => 
      axios.get('https://api-mainnet.magiceden.dev/v2/collections/froganas/listings', {
        params: {
          limit: batchSize,
          offset: i * batchSize
        },
        headers: {
          'Accept': 'application/json'
        }
      })
    );

    const responses = await Promise.all(requests);
    
    // Combine all NFTs from responses
    responses.forEach(response => {
      const validNFTs = response.data
        .filter(listing => listing.token && listing.token.image)
        .map((listing, index) => ({
          id: allNFTs.length + index, // Ensure unique IDs
          name: listing.token.name,
          image: listing.token.image,
          mint: listing.token.mint,
          health: 2,
          wins: 0,
          losses: 0
        }));
      
      allNFTs = [...allNFTs, ...validNFTs];
    });

    console.log(`Fetched ${allNFTs.length} total NFTs before shuffling`);

    if (allNFTs.length < requiredNFTs) {
      throw new Error(`Only found ${allNFTs.length} valid NFTs, need ${requiredNFTs}`);
    }

    // Shuffle and select required number of NFTs
    const shuffledNFTs = allNFTs
      .sort(() => Math.random() - 0.5)
      .slice(0, requiredNFTs);

    console.log(`Successfully prepared ${shuffledNFTs.length} NFTs for tournament`);
    return shuffledNFTs;

  } catch (error) {
    console.error('Error fetching NFTs:', error);
    throw new Error(`Failed to fetch NFTs: ${error.message}`);
  }
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});