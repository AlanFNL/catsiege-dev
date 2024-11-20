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
  
  // Calculate completed matches based on the difference between initial bracket size and current size
  const completedMatches = Math.floor((currentRoundSize - currentBracket.length) / 2);
  
  // Calculate remaining matches in current round
  const remainingMatches = Math.floor(currentBracket.length / 2);
  
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
    // First check for ongoing tournament
    const ongoingTournament = await Tournament.findOne({ isRunning: true });
    if (ongoingTournament) {
      console.log('Found ongoing tournament:', ongoingTournament._id);
      tournamentState = ongoingTournament.toObject();
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

  socket.on('initializeTournament', async (data) => {
    console.log('Initializing new tournament...');
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
      tournamentState = newTournament.toObject();
      
      console.log('Tournament created, starting matches...');
      io.emit('tournamentState', tournamentState);
      runTournament();
    } catch (error) {
      console.error('Tournament initialization error:', error);
      socket.emit('error', { 
        message: 'Failed to initialize tournament: ' + error.message 
      });
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

// Update the simulateBattle function with new hit mechanics
function simulateBattle(nft1, nft2, isFeatured) {
  return new Promise(resolve => {
    const firstAttacker = Math.random() > 0.5 ? nft1 : nft2;
    const secondAttacker = firstAttacker === nft1 ? nft2 : nft1;
    
    console.log('Battle starting:', { isFeatured, firstAttacker: firstAttacker.name });

    if (isFeatured) {
      console.log('Emitting coinFlip event');
      io.emit('coinFlip', {
        winner: firstAttacker,
        loser: secondAttacker
      });
    }

    setTimeout(() => {
      const dice1 = Math.floor(Math.random() * 6) + 1;
      const dice2 = Math.floor(Math.random() * 6) + 1;
      const initialDamage = dice1 + dice2;

      if (isFeatured) {
        console.log('Emitting diceRoll event');
        io.emit('diceRoll', {
          attacker: firstAttacker,
          defender: secondAttacker,
          dice1,
          dice2,
          totalDamage: initialDamage
        });
      }

      setTimeout(() => {
        if (isFeatured) {
          console.log('Emitting initial nftHit event');
          io.emit('nftHit', {
            attacker: firstAttacker,
            target: secondAttacker,
            damage: initialDamage
          });
        }

        // ... rest of the battle logic ...

      }, 2000); // dice roll animation
    }, 4000); // coin flip animation
  });
}

// Update the runTournament function to emit state after each match pair
async function runTournament() {
  while (tournamentState.isRunning) {
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
          nft1: currentBracket[i],
          nft2: currentBracket[i + 1]
        };
        matchPairs.push(matchPair);
        
        // Set first match as featured if none is set
        if (!tournamentState.currentFeaturedMatch && i === 0) {
          tournamentState.currentFeaturedMatch = matchPair;
        }
      }
    }

    // Select ONE featured battle for this round
    const randomIndex = Math.floor(Math.random() * matchPairs.length);
    tournamentState.currentFeaturedMatch = matchPairs[randomIndex];
    tournamentState.currentMatches = matchPairs;
    
    emitTournamentState();
    
    // Run all battles simultaneously
    const battlePromises = matchPairs.map(pair => 
      simulateBattle(
        pair.nft1, 
        pair.nft2, 
        pair === tournamentState.currentFeaturedMatch // Pass isFeatured flag
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

// Add rate limiting to avoid API issues
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Optional: Add retry logic for failed requests
async function fetchWithRetry(url, config, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url, config);
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      await delay(1000 * (i + 1)); // Exponential backoff
    }
  }
}

async function fetchNFTsUsingHelius() {
  try {
    const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
    const endpoint = `https://api.helius.xyz/v0/token-metadata?api-key=${HELIUS_API_KEY}`;

    // Froganas collection address
    const collectionAddress = 'YOUR_COLLECTION_ADDRESS';

    const response = await axios.post(endpoint, {
      query: {
        collection: collectionAddress
      },
      options: {
        limit: 10000 // Adjust based on collection size
      }
    });

    const nfts = response.data.result
      .filter(nft => nft.onChainMetadata.metadata.data.uri)
      .map((nft, index) => ({
        id: index,
        name: nft.onChainMetadata.metadata.data.name,
        image: nft.onChainMetadata.metadata.data.uri,
        mint: nft.mint,
        health: 2,
        wins: 0,
        losses: 0
      }));

    return nfts;
  } catch (error) {
    console.error('Error fetching NFTs using Helius:', error);
    throw error;
  }
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});